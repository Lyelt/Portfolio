using Portfolio.Models.Yugioh;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public class YugiohApiClient
    {
        private readonly HttpClient _client;

        public YugiohApiClient(HttpClient client)
        {
            _client = client;
        }

        public async Task<IEnumerable<YugiohCard>> FindCardsAsync()
        {
            var response = await _client.GetAsync("");
            if (response.IsSuccessStatusCode)
            {
                var wrapper = await response.Content.ReadAsAsync<YugiohCardApiWrapper>();
                return wrapper.Data;
            }

            return new List<YugiohCard>();
        }

        private class YugiohCardApiWrapper
        {
            public IEnumerable<YugiohCard> Data { get; set; }
        }
    }
}
