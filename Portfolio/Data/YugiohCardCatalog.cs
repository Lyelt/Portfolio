using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Portfolio.Models.Errors;
using Portfolio.Models.Yugioh;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public interface IYugiohCardCatalog
    {
        Task<IReadOnlyList<YugiohCard>> GetCardsAsync(CancellationToken cancellationToken);
    }

    public sealed class YugiohCardCatalog : IYugiohCardCatalog
    {
        private readonly object _refreshLock = new object();
        private readonly IYugiohApiClient _apiClient;
        private readonly ILogger<YugiohCardCatalog> _logger;
        private readonly TimeProvider _timeProvider;
        private readonly YugiohCatalogOptions _options;

        private CatalogSnapshot _snapshot = CatalogSnapshot.Empty;
        private Task<IReadOnlyList<YugiohCard>> _refreshTask;

        public YugiohCardCatalog(
            IYugiohApiClient apiClient,
            IOptions<YugiohCatalogOptions> options,
            ILogger<YugiohCardCatalog> logger,
            TimeProvider timeProvider)
        {
            _apiClient = apiClient;
            _options = options.Value;
            _logger = logger;
            _timeProvider = timeProvider;
        }

        public async Task<IReadOnlyList<YugiohCard>> GetCardsAsync(CancellationToken cancellationToken)
        {
            var snapshot = Volatile.Read(ref _snapshot);
            var now = _timeProvider.GetUtcNow();
            if (snapshot.IsFresh(now))
            {
                _logger.LogDebug(
                    "Yu-Gi-Oh catalog cache hit with {CardCount} cards loaded {CacheAge} ago",
                    snapshot.Cards.Count,
                    now - snapshot.LoadedAt);
                return snapshot.Cards;
            }

            var refreshTask = GetOrStartRefresh();
            return await refreshTask.WaitAsync(cancellationToken);
        }

        private Task<IReadOnlyList<YugiohCard>> GetOrStartRefresh()
        {
            lock (_refreshLock)
            {
                var snapshot = Volatile.Read(ref _snapshot);
                if (snapshot.IsFresh(_timeProvider.GetUtcNow()))
                    return Task.FromResult(snapshot.Cards);

                if (_refreshTask == null || _refreshTask.IsCompleted)
                {
                    _logger.LogInformation(
                        "Refreshing the Yu-Gi-Oh card catalog with a {RequestTimeout} timeout",
                        _options.RequestTimeout);
                    _refreshTask = RefreshAsync();
                }
                else
                {
                    _logger.LogDebug("Joining the in-progress Yu-Gi-Oh catalog refresh");
                }

                return _refreshTask;
            }
        }

        private async Task<IReadOnlyList<YugiohCard>> RefreshAsync()
        {
            var stopwatch = Stopwatch.StartNew();
            using var timeout = new CancellationTokenSource(_options.RequestTimeout);

            try
            {
                var cards = await _apiClient.FindCardsAsync(timeout.Token);
                if (cards == null || cards.Count == 0)
                    throw new InvalidOperationException("The upstream Yu-Gi-Oh catalog was empty.");

                var loadedAt = _timeProvider.GetUtcNow();
                var snapshot = new CatalogSnapshot(cards, loadedAt, loadedAt + _options.CacheDuration);
                Volatile.Write(ref _snapshot, snapshot);

                _logger.LogInformation(
                    "Refreshed the Yu-Gi-Oh catalog with {CardCount} cards in {RefreshDuration}; cache expires at {CacheExpiresAt}",
                    cards.Count,
                    stopwatch.Elapsed,
                    snapshot.FreshUntil);
                return cards;
            }
            catch (Exception exception)
            {
                var staleSnapshot = Volatile.Read(ref _snapshot);
                if (staleSnapshot.Cards.Count > 0)
                {
                    _logger.LogWarning(
                        exception,
                        "Yu-Gi-Oh catalog refresh failed after {RefreshDuration}; serving {CardCount} stale cards loaded at {LoadedAt}",
                        stopwatch.Elapsed,
                        staleSnapshot.Cards.Count,
                        staleSnapshot.LoadedAt);
                    return staleSnapshot.Cards;
                }

                _logger.LogError(
                    exception,
                    "Yu-Gi-Oh catalog refresh failed after {RefreshDuration} and no cached catalog is available",
                    stopwatch.Elapsed);
                throw new HttpStatusException(
                    HttpStatusCode.ServiceUnavailable,
                    "The Yu-Gi-Oh card catalog is temporarily unavailable.");
            }
        }

        private sealed class CatalogSnapshot
        {
            public static readonly CatalogSnapshot Empty = new CatalogSnapshot(
                Array.Empty<YugiohCard>(),
                DateTimeOffset.MinValue,
                DateTimeOffset.MinValue);

            public CatalogSnapshot(
                IReadOnlyList<YugiohCard> cards,
                DateTimeOffset loadedAt,
                DateTimeOffset freshUntil)
            {
                Cards = cards;
                LoadedAt = loadedAt;
                FreshUntil = freshUntil;
            }

            public IReadOnlyList<YugiohCard> Cards { get; }

            public DateTimeOffset LoadedAt { get; }

            public DateTimeOffset FreshUntil { get; }

            public bool IsFresh(DateTimeOffset now) => Cards.Count > 0 && now < FreshUntil;
        }
    }
}
