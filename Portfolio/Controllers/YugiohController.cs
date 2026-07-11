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
using Portfolio.Models.Yugioh;
using Microsoft.AspNetCore.Authorization;
using Portfolio.Extensions;
using Portfolio.Models.Errors;
using System.Threading;

namespace Portfolio.Controllers
{
    public class YugiohController : Controller
    {
        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.Duelist.ToString() };

        private readonly PortfolioContext _userContext;
        private readonly YugiohContext _yugiohContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<YugiohController> _logger;
        private readonly IYugiohCardCatalog _cardCatalog;

        public YugiohController(PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<YugiohController> logger, IYugiohCardCatalog cardCatalog, YugiohContext yugiohContext)
        {
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
            _cardCatalog = cardCatalog;
            _yugiohContext = yugiohContext;
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("Yugioh/GetCards/{pageNumber}/{count}/{nameFilter?}")]
        public async Task<IActionResult> GetCards(int pageNumber, int count, string nameFilter, CancellationToken cancellationToken)
        {
            var cards = await GetCardsAsync(cancellationToken, nameFilter);
            var pageSize = Math.Max(count, 0);
            return Ok(cards.Skip((Math.Max(pageNumber, 1) - 1) * pageSize).Take(pageSize).ToList());
        }

        [HttpGet]
        [AllowAnonymous]
        [Route("Yugioh/GetCardById/{cardId}")]
        public async Task<IActionResult> GetCardById(int cardId, CancellationToken cancellationToken)
        {
            var cards = await GetCardsAsync(cancellationToken);
            return Ok(cards.FirstOrDefault(c => c.Id == cardId));
        }

        [HttpPost]
        [AllowAnonymous]
        [Route("Yugioh/GetCardsWithFilter")]
        public async Task<IActionResult> GetCardsWithFilter([FromBody] YugiohCardFilter filter, CancellationToken cancellationToken)
        {
            var cards = await GetCardsAsync(cancellationToken, GetNameFilter(filter));
            var pageNumber = Math.Max(filter?.PageNumber ?? 1, 1);
            var count = filter?.Count > 0 ? filter.Count : 20;
            return Ok(new SearchResults
            {
                Results = cards.Skip((pageNumber - 1) * count).Take(count).ToList(),
                TotalResults = cards.Count
            });
        }

        [HttpGet]
        [Route("Yugioh/GetUsers")]
        public IActionResult GetUsers()
        {
            var duelists = _userContext.GetValidUsersForRoles(VALID_ROLES);
            _logger.LogDebug($"Found {duelists.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
            return Ok(duelists.Select(u => u.AsClientUser()));
        }

        [HttpGet]
        [Route("Yugioh/GetCollections/{userId}")]
        public async Task<IActionResult> GetCollections(string userId, CancellationToken cancellationToken)
        {
            var collections = await _yugiohContext.Collections
                .Where(cc => cc.UserId.Equals(userId))
                .Include(cc => cc.CardIds)
                .ToListAsync(cancellationToken);

            var allCards = await GetCardsAsync(cancellationToken);

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
        public async Task<IActionResult> AddCardToCollection([FromBody] Card card, CancellationToken cancellationToken)
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
            await _yugiohContext.SaveChangesAsync(cancellationToken);

            collection.PopulateCards(await GetCardsAsync(cancellationToken));
            return Ok(collection);
        }

        [HttpPost]
        [Route("Yugioh/DeleteCardFromCollection")]
        public async Task<IActionResult> DeleteCardFromCollection([FromBody] Card card, CancellationToken cancellationToken)
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
            await _yugiohContext.SaveChangesAsync(cancellationToken);

            collection.PopulateCards(await GetCardsAsync(cancellationToken));
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

        private async Task<IReadOnlyList<YugiohCard>> GetCardsAsync(CancellationToken cancellationToken, string nameFilter = null)
        {
            var cards = await _cardCatalog.GetCardsAsync(cancellationToken);
            if (string.IsNullOrWhiteSpace(nameFilter))
                return cards;

            return cards
                .Where(card => card.Name != null && card.Name.ContainsIgnoreCase(nameFilter))
                .ToList();
        }

        private static string GetNameFilter(YugiohCardFilter filter) => filter?.Filters?
            .FirstOrDefault(propertyFilter => string.Equals(propertyFilter?.Name, "name", StringComparison.OrdinalIgnoreCase))?
            .Value;

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
