using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Portfolio.Data;
using Portfolio.Models.Errors;
using Portfolio.Models.Yugioh;
using System.Net;
using System.Text;

namespace Portfolio.Tests;

public sealed class YugiohCardCatalogTests
{
    [Fact]
    public async Task TwentySimultaneousColdCallersShareOneUpstreamRequest()
    {
        var requestEntered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var releaseRequest = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var handler = new StubHttpMessageHandler(async (_, cancellationToken) =>
        {
            requestEntered.TrySetResult();
            await releaseRequest.Task.WaitAsync(cancellationToken);
            return JsonResponse("""{"data":[{"id":1,"name":"Shared card"}]}""");
        });
        var catalog = CreateCatalog(handler);

        var callers = Enumerable.Range(0, 20)
            .Select(_ => catalog.GetCardsAsync(CancellationToken.None))
            .ToArray();

        await requestEntered.Task;
        Assert.Equal(1, handler.RequestCount);

        releaseRequest.TrySetResult();
        var results = await Task.WhenAll(callers);

        Assert.Equal(1, handler.RequestCount);
        Assert.All(results, result => Assert.Same(results[0], result));
        Assert.All(results, result => Assert.Equal("Shared card", Assert.Single(result).Name));
    }

    [Fact]
    public async Task NumericCardImageIdsMatchTheUpstreamCatalogShape()
    {
        var handler = new StubHttpMessageHandler((_, _) => Task.FromResult(JsonResponse(
            """{"data":[{"id":80181649,"name":"Image card","card_images":[{"id":80181649,"image_url":"https://example.test/card.jpg","image_url_small":"https://example.test/card-small.jpg"}]}]}""")));
        var catalog = CreateCatalog(handler);

        var card = Assert.Single(await catalog.GetCardsAsync(CancellationToken.None));
        var image = Assert.Single(card.Card_Images);

        Assert.Equal(80181649, image.Id);
    }

    [Fact]
    public async Task FailedRefreshReturnsLastKnownGoodCatalog()
    {
        var timeProvider = new ManualTimeProvider(DateTimeOffset.Parse("2026-01-01T00:00:00Z"));
        var responseNumber = 0;
        var handler = new StubHttpMessageHandler((_, _) => Task.FromResult(
            Interlocked.Increment(ref responseNumber) == 1
                ? JsonResponse("""{"data":[{"id":7,"name":"Cached card"}]}""")
                : new HttpResponseMessage(HttpStatusCode.ServiceUnavailable)));
        var catalog = CreateCatalog(handler, timeProvider, cacheDurationMinutes: 10);

        var initial = await catalog.GetCardsAsync(CancellationToken.None);
        timeProvider.Advance(TimeSpan.FromMinutes(11));
        var stale = await catalog.GetCardsAsync(CancellationToken.None);

        Assert.Equal(2, handler.RequestCount);
        Assert.Same(initial, stale);
        Assert.Equal("Cached card", Assert.Single(stale).Name);
    }

    [Fact]
    public async Task UpstreamFailureWithoutCacheProducesServiceUnavailable()
    {
        var handler = new StubHttpMessageHandler((_, _) => Task.FromResult(
            new HttpResponseMessage(HttpStatusCode.GatewayTimeout)));
        var catalog = CreateCatalog(handler);

        var exception = await Assert.ThrowsAsync<HttpStatusException>(
            () => catalog.GetCardsAsync(CancellationToken.None));

        Assert.Equal(HttpStatusCode.ServiceUnavailable, exception.StatusCode);
        Assert.DoesNotContain("null", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData("null")]
    [InlineData("{}")]
    [InlineData("{\"data\":null}")]
    [InlineData("{\"data\":[]}")]
    [InlineData("not-json")]
    public async Task NullOrMalformedBodiesProduceControlledFailure(string responseBody)
    {
        var handler = new StubHttpMessageHandler((_, _) => Task.FromResult(JsonResponse(responseBody)));
        var catalog = CreateCatalog(handler);

        var exception = await Assert.ThrowsAsync<HttpStatusException>(
            () => catalog.GetCardsAsync(CancellationToken.None));

        Assert.Equal(HttpStatusCode.ServiceUnavailable, exception.StatusCode);
        Assert.IsNotType<ArgumentNullException>(exception);
    }

    [Fact]
    public async Task CancelingOneWaiterDoesNotCancelTheSharedRefresh()
    {
        var requestEntered = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var releaseRequest = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var handler = new StubHttpMessageHandler(async (_, cancellationToken) =>
        {
            requestEntered.TrySetResult();
            await releaseRequest.Task.WaitAsync(cancellationToken);
            return JsonResponse("""{"data":[{"id":3,"name":"Still loading"}]}""");
        });
        var catalog = CreateCatalog(handler);
        var survivingWaiter = catalog.GetCardsAsync(CancellationToken.None);
        await requestEntered.Task;

        using var canceled = new CancellationTokenSource();
        var canceledWaiter = catalog.GetCardsAsync(canceled.Token);
        canceled.Cancel();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => canceledWaiter);

        releaseRequest.TrySetResult();
        var cards = await survivingWaiter;

        Assert.Equal(1, handler.RequestCount);
        Assert.Equal("Still loading", Assert.Single(cards).Name);
    }

    private static YugiohCardCatalog CreateCatalog(
        StubHttpMessageHandler handler,
        TimeProvider timeProvider = null,
        int cacheDurationMinutes = 360)
    {
        var apiClient = new YugiohApiClient(new StubHttpClientFactory(handler));
        var options = Options.Create(new YugiohCatalogOptions
        {
            CacheDurationMinutes = cacheDurationMinutes,
            RequestTimeoutSeconds = 30
        });
        return new YugiohCardCatalog(
            apiClient,
            options,
            NullLogger<YugiohCardCatalog>.Instance,
            timeProvider ?? TimeProvider.System);
    }

    private static HttpResponseMessage JsonResponse(string body) => new HttpResponseMessage(HttpStatusCode.OK)
    {
        Content = new StringContent(body, Encoding.UTF8, "application/json")
    };

    private sealed class StubHttpClientFactory : IHttpClientFactory
    {
        private readonly HttpMessageHandler _handler;

        public StubHttpClientFactory(HttpMessageHandler handler)
        {
            _handler = handler;
        }

        public HttpClient CreateClient(string name) => new HttpClient(_handler, disposeHandler: false)
        {
            BaseAddress = new Uri("https://example.test/cards")
        };
    }

    private sealed class StubHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> _sendAsync;
        private int _requestCount;

        public StubHttpMessageHandler(Func<HttpRequestMessage, CancellationToken, Task<HttpResponseMessage>> sendAsync)
        {
            _sendAsync = sendAsync;
        }

        public int RequestCount => Volatile.Read(ref _requestCount);

        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            Interlocked.Increment(ref _requestCount);
            return _sendAsync(request, cancellationToken);
        }
    }

    private sealed class ManualTimeProvider : TimeProvider
    {
        private DateTimeOffset _utcNow;

        public ManualTimeProvider(DateTimeOffset utcNow)
        {
            _utcNow = utcNow;
        }

        public override DateTimeOffset GetUtcNow() => _utcNow;

        public void Advance(TimeSpan duration)
        {
            _utcNow += duration;
        }
    }
}
