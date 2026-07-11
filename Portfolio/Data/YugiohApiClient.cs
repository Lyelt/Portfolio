using Portfolio.Models.Yugioh;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public interface IYugiohApiClient
    {
        Task<IReadOnlyList<YugiohCard>> FindCardsAsync(CancellationToken cancellationToken);
    }

    public sealed class YugiohApiClient : IYugiohApiClient
    {
        public const string HttpClientName = "YugiohCatalog";

        private static readonly JsonSerializerOptions SerializerOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            NumberHandling = JsonNumberHandling.AllowReadingFromString
        };

        private readonly IHttpClientFactory _clientFactory;

        public YugiohApiClient(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        public async Task<IReadOnlyList<YugiohCard>> FindCardsAsync(CancellationToken cancellationToken)
        {
            var client = _clientFactory.CreateClient(HttpClientName);
            using var response = await client.GetAsync(
                "",
                HttpCompletionOption.ResponseHeadersRead,
                cancellationToken);
            response.EnsureSuccessStatusCode();

            await using var responseStream = await response.Content.ReadAsStreamAsync(cancellationToken);
            YugiohCardApiWrapper wrapper;
            try
            {
                wrapper = await JsonSerializer.DeserializeAsync<YugiohCardApiWrapper>(
                    responseStream,
                    SerializerOptions,
                    cancellationToken);
            }
            catch (JsonException exception)
            {
                throw new InvalidDataException("The upstream Yu-Gi-Oh catalog response was malformed.", exception);
            }

            if (wrapper?.Data == null || wrapper.Data.Count == 0)
                throw new InvalidDataException("The upstream Yu-Gi-Oh catalog response did not contain any cards.");

            return wrapper.Data;
        }

        private sealed class YugiohCardApiWrapper
        {
            [JsonPropertyName("data")]
            public List<YugiohCard> Data { get; set; }
        }
    }
}
