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
        private readonly YugiohApiClient _yugiohClient;

        public YugiohController(PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<YugiohController> logger, IMemoryCache cardCache, YugiohApiClient yugiohClient)
        {
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
            _cardCache = cardCache;
            _yugiohClient = yugiohClient;
        }

        [HttpGet]
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        [Route("Yugioh/GetCards/{pageNumber}/{count}/{nameFilter?}")]
        public async Task<IActionResult> GetCards(int pageNumber, int count, string nameFilter)
        {
            IEnumerable<YugiohCard> cards = new List<YugiohCard>();

            try
            {
                if (!_cardCache.TryGetValue(CACHE_KEY, out cards))
                {
                    cards = await _yugiohClient.FindCardsAsync();
                    _cardCache.Set(CACHE_KEY, cards, new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(5)));
                }

                if (!string.IsNullOrWhiteSpace(nameFilter))
                    cards = cards.Where(c => c.Name.Contains(nameFilter, StringComparison.OrdinalIgnoreCase));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return Ok(cards.Skip((pageNumber - 1) * count).Take(count).ToList());
        }
    }
}
