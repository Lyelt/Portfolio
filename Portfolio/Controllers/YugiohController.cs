﻿using Microsoft.AspNetCore.Identity;
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
        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        [Route("Yugioh/GetCards/{pageNumber}/{count}/{nameFilter?}")]
        public async Task<IActionResult> GetCards(int pageNumber, int count, string nameFilter)
        {
            IEnumerable<YugiohCard> cards = new List<YugiohCard>();

            try
            {
                cards = await GetCardsAsync(nameFilter);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
            }

            return Ok(cards.Skip((pageNumber - 1) * count).Take(count).ToList());
        }

        [HttpGet]
        [Route("Yugioh/GetUsers")]
        public IActionResult GetUsers()
        {
            try
            {
                var validRoles = _userContext.Roles.Where(r => VALID_ROLES.Contains(r.Name));
                var validUserRoles = _userContext.UserRoles.Join(validRoles, ur => ur.RoleId, r => r.Id, (userRole, role) => userRole);
                var validUsers = _userContext.Users.Join(validUserRoles, u => u.Id, ur => ur.UserId, (user, userRole) => user).Distinct().ToList();

                _logger.LogDebug($"Found {validUsers.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
                return Ok(validUsers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining user information: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("Yugioh/GetCollections/{userId}")]

        public async Task<IActionResult> GetCollections(string userId)
        {
            var collections = new List<CardCollection>();

            try
            {
                collections = await _yugiohContext.Collections
                    .Where(cc => cc.UserId.Equals(userId))
                    .Include(cc => cc.CardIds)
                    .ToListAsync();

                foreach (var collection in collections)
                    collection.PopulateCards(await GetCardsAsync());

                _logger.LogDebug($"Found {collections.Count} collections for user ID {userId}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while retrieving collections: {ex.Message}");
            }

            return Ok(collections);
        }

        [HttpPost]
        [Route("Yugioh/UpdateCollection/{collection}")]
        public async Task<IActionResult> UpdateCollection([FromBody]CardCollection collection)
        {
            try
            {
                if (await _yugiohContext.Collections.ContainsAsync(collection))
                    _yugiohContext.Collections.Update(collection);
                else
                    await _yugiohContext.Collections.AddAsync(collection);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while creating collection: {ex.Message}");
            }

            return Ok(collection);
        }

        [HttpPost]
        [Route("Yugioh/AddCardToCollection/{card}")]
        public async Task<IActionResult> AddCardToCollection(Card card)
        {
            try
            {
                _logger.LogInformation($"Adding {card.Quantity} copies of card #{card.Id} to collection {card.CardCollection.Id}");

                var collection = await _yugiohContext.Collections.FindAsync(card.CardCollection);
                collection.CardIds.Add(card);
                await _yugiohContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while creating collection: {ex.Message}");
            }

            return Ok(await GetCardByIdAsync(card.Id));
        }

        private async Task<IEnumerable<YugiohCard>> GetCardsAsync(string nameFilter = null)
        {
            IEnumerable<YugiohCard> cards;

            if (!_cardCache.TryGetValue(CACHE_KEY, out cards))
            {
                cards = await _yugiohClient.FindCardsAsync();
                _cardCache.Set(CACHE_KEY, cards, new MemoryCacheEntryOptions().SetSlidingExpiration(TimeSpan.FromMinutes(5)));
            }

            if (!string.IsNullOrWhiteSpace(nameFilter))
                cards = cards.Where(c => c.Name.Contains(nameFilter, StringComparison.OrdinalIgnoreCase));

            return cards;
        }

        private async Task<YugiohCard> GetCardByIdAsync(int cardId) => (await GetCardsAsync()).First(c => c.Id == cardId);
    }
}