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
using Microsoft.AspNetCore.Authorization;
using Portfolio.Extensions;
using Portfolio.Models.Errors;

namespace Portfolio.Controllers
{
    public class YugiohController : Controller
    {
        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.Duelist.ToString() };

        private const string CACHE_KEY = "_Cards";

        private readonly PortfolioContext _userContext;
        private readonly YugiohContext _yugiohContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<YugiohController> _logger;
        private readonly IMemoryCache _cardCache;
        private readonly YugiohApiClient _yugiohClient;

        public YugiohController(PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<YugiohController> logger, IMemoryCache cardCache, YugiohApiClient yugiohClient, YugiohContext yugiohContext)
        {
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
            _cardCache = cardCache;
            _yugiohClient = yugiohClient;
            _yugiohContext = yugiohContext;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("Yugioh/GetCards/{pageNumber}/{count}/{nameFilter?}")]
        public async Task<IActionResult> GetCards(int pageNumber, int count, string nameFilter)
        {
            var cards = await GetCardsAsync();
            return Ok(cards.Skip((pageNumber - 1) * count).Take(count).ToList());
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("Yugioh/GetCardById/{cardId}")]
        public async Task<IActionResult> GetCardById(int cardId)
        {
            var cards = await GetCardsAsync();
            return Ok(cards.FirstOrDefault(c => c.Id == cardId));
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("Yugioh/GetCardsWithFilter")]
        public async Task<IActionResult> GetCardsWithFilter([FromBody] YugiohCardFilter filter)
        {
            var cards = await GetCardsAsync(filter);
            return Ok(cards.Skip(((filter?.PageNumber ?? 1) - 1) * filter?.Count ?? 20).Take(filter?.Count ?? 20).ToList());
        }

        [HttpGet]
        [Route("Yugioh/GetUsers")]
        public IActionResult GetUsers()
        {
            var duelists = _userContext.GetValidUsersForRoles(VALID_ROLES);
            _logger.LogDebug($"Found {duelists.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
            return Ok(duelists);
        }

        [HttpGet]
        [Route("Yugioh/GetCollections/{userId}")]
        public async Task<IActionResult> GetCollections(string userId)
        {
            var collections = await _yugiohContext.Collections
                .Where(cc => cc.UserId.Equals(userId))
                .Include(cc => cc.CardIds)
                .ToListAsync();

            var allCards = await GetCardsAsync();

            foreach (var collection in collections)
                collection.PopulateCards(allCards);

            _logger.LogDebug($"Found {collections.Count} collections for user ID {userId}");

            return Ok(collections);
        }

        [HttpPost]
        [Route("Yugioh/UpdateCollection")]
        public async Task<IActionResult> UpdateCollection([FromBody]CardCollection collection)
        {
            if (!await UserCanPerformAction(collection.UserId))
                throw new UnauthorizedException("User does not have the required permissions to update this collection");

            if (await _yugiohContext.Collections.ContainsAsync(collection))
                _yugiohContext.Collections.Update(collection);
            else
                await _yugiohContext.Collections.AddAsync(collection);

            await _yugiohContext.SaveChangesAsync();
            return Ok(collection);
        }

        [HttpPost]
        [Route("Yugioh/DuplicateCollection")]
        public async Task<IActionResult> DuplicateCollection([FromBody]CardCollection collection)
        {
            if (!await UserCanPerformAction(collection.UserId))
                throw new UnauthorizedException("User does not have the required permissions to duplicate this collection");

            var newCollection = collection.GetCopy();
            await _yugiohContext.Collections.AddAsync(newCollection);
            await _yugiohContext.SaveChangesAsync();
            return Ok(newCollection);
        }

        [HttpPost]
        [Route("Yugioh/AddCardToCollection")]
        public async Task<IActionResult> AddCardToCollection([FromBody] Card card)
        {
            if (!await UserCanPerformAction(card.CardCollection.UserId))
                throw new UnauthorizedException("User does not have the required permissions to update this collection");

            _logger.LogInformation($"Adding card #{card.Id} in set {card.SetCode} to collection {card.CardCollection.UserId}/{card.CardCollection.Name}/{card.Section}");

            var collection = await _yugiohContext.Collections
                .Include(c => c.CardIds)
                .FirstOrDefaultAsync(c => c.Id == card.CardCollection.Id);

            var existingCard = collection.CardIds.FirstOrDefault(c => c.Id == card.Id);
            if (existingCard == null)
                collection.CardIds.Add(card);
            else
                existingCard.Quantity++;

            card.Quantity++;
            await _yugiohContext.SaveChangesAsync();

            collection.PopulateCards(await GetCardsAsync());
            return Ok(collection);
        }

        [HttpPost]
        [Route("Yugioh/DeleteCardFromCollection")]
        public async Task<IActionResult> DeleteCardFromCollection([FromBody] Card card)
        {
            if (!await UserCanPerformAction(card.CardCollection.UserId))
                throw new UnauthorizedException("User does not have the required permissions to delete from this collection");

            _logger.LogInformation($"Deleting card #{card.Id} in set {card.SetCode} from collection {card.CardCollection.UserId}/{card.CardCollection.Name}/{card.Section}");

            var collection = await _yugiohContext.Collections
                .Include(c => c.CardIds)
                .FirstOrDefaultAsync(c => c.Id == card.CardCollection.Id);

            var existingCard = collection.CardIds.FirstOrDefault(c => c.Id == card.Id && c.SetCode == card.SetCode && c.Section == card.Section);
            if (existingCard != null && --existingCard.Quantity == 0)
            {
                collection.CardIds.RemoveAll(c => c.Id == card.Id && c.SetCode == card.SetCode && c.Section == card.Section);
            }
            await _yugiohContext.SaveChangesAsync();

            collection.PopulateCards(await GetCardsAsync());
            return Ok(collection);
        }

        [HttpDelete]
        [Route("Yugioh/DeleteCollection/{collectionId}")]
        public async Task<IActionResult> DeleteCollection(int collectionId)
        {
            var collection = await _yugiohContext.Collections.FindAsync(collectionId);

            if (!await UserCanPerformAction(collection.UserId))
                throw new UnauthorizedException("User does not have the required permissions to delete this collection");

            _logger.LogInformation($"Deleting collection #{collectionId}");

            _yugiohContext.Collections.Remove(collection);
            await _yugiohContext.SaveChangesAsync();
            return Ok(collection);
        }

        private async Task<IEnumerable<YugiohCard>> GetCardsAsync(YugiohCardFilter filter = null)
        {
            IEnumerable<YugiohCard> cards;

            if (!_cardCache.TryGetValue(CACHE_KEY, out cards))
            {
                cards = await _yugiohClient.FindCardsAsync();
                _cardCache.Set(CACHE_KEY, cards, new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(5)));
            }

            var nameFilter = filter?.Filters?.FirstOrDefault(f => f.Name.EqualsIgnoreCase("name"));
            if (!string.IsNullOrWhiteSpace(nameFilter?.Value))
                cards = cards.Where(c => c.Name.ContainsIgnoreCase(nameFilter.Value));

            return cards;
        }

        // Ensure the given user ID matches the current user, and that they are in the appropriate role
        private async Task<bool> UserCanPerformAction(string itemUserId)
        {
            var currentUser = await GetCurrentUserAsync();
            return await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Administrator.ToString()) ||
                (itemUserId == currentUser.Id && 
                await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Duelist.ToString()));
        }

        private async Task<ApplicationUser> GetCurrentUserAsync() => await _userManager.GetUserAsync(User);
    }
}
