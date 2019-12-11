using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Portfolio.Identity;
using Portfolio.Data;
using Portfolio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Portfolio.Models.Auth;
using Microsoft.Extensions.Caching.Memory;
using Portfolio.Models.Yugioh;
using System.Net.Http;
using MoreLinq;

namespace Portfolio.Controllers
{
    public class YugiohController : Controller
    {
        private const string CACHE_KEY = "_Cards";

        private readonly PortfolioContext _userContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<YugiohController> _logger;
        private readonly IMemoryCache _cardCache;

        public YugiohController(PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<YugiohController> logger, IMemoryCache cardCache)
        {
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
            _cardCache = cardCache;
        }

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        [Route("Yugioh/GetCards/{pageNumber}/{count}")]
        public async Task<IActionResult> GetCards(int pageNumber, int count)
        {
            IEnumerable<YugiohCard> cards = new List<YugiohCard>();

            try
            {
                if (!_cardCache.TryGetValue(CACHE_KEY, out cards))
                {
                    cards = await FindCardsAsync("");
                    _cardCache.Set(CACHE_KEY, cards, new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(5)));
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }
            //cards.OrderByDescending(c => c.Card_Prices.Tcgplayer_Price).Take(100);
            //var tst = string.Join(",", cards.OrderByDescending(c => c.Card_Prices.Tcgplayer_Price).Take(100).Select(c => $"{c.Name}:{c.Card_Prices.Tcgplayer_Price}{Environment.NewLine}"));
            
            //var card = string.Join(Environment.NewLine, cards.OrderByDescending(c => c.Name.Split(new char[] { ' ' }).Where(s => s != "-").Count()).Take(100).Select(c => c.Name));
            
            //var card = string.Join(Environment.NewLine, cards.OrderByDescending(c => c.Desc.Length).Take(100).Select(c => $"{c.Name}: {c.Desc}"));
            
            return Ok(cards.Skip((pageNumber - 1) * count).Take(count).ToList());
        }

        private async Task<IEnumerable<YugiohCard>> FindCardsAsync(string requestParams)
        {
            using var httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri("https://db.ygoprodeck.com/api/v5/cardinfo.php");

            var response = await httpClient.GetAsync(requestParams);
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<IEnumerable<YugiohCard>>();
            }

            return new List<YugiohCard>();
        }
    }
}
