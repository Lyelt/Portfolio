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
using Portfolio.Models.GameNight;
using Portfolio.Models.Auth;
using Portfolio.Models.Errors;
using Portfolio.Extensions;

namespace Portfolio.Controllers
{
    public class GameNightController : Controller
    {
        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.Gamer.ToString() };

        private readonly GameNightContext _gnContext;
        private readonly PortfolioContext _userContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<GameNightController> _logger;
        private readonly IGameNightService _gnService;

        public GameNightController(GameNightContext context, PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<GameNightController> logger, IGameNightService gnService)
        {
            _gnContext = context;
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
            _gnService = gnService;
        }

        [HttpGet]
        [Route("GameNight/GetUsers")]
        public IActionResult GetUsers()
        {
            var gamers = _userContext.GetValidUsersForRoles(VALID_ROLES);
            _logger.LogDebug($"Found {gamers.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
            return Ok(gamers);
        }

        [HttpGet]
        [Route("GameNight/GetGames")]
        public IActionResult GetGames()
        {
            List<GameNightGame> games = _gnContext.Games.ToList();
            _logger.LogDebug($"Found {games.Count} total games.");
            return Ok(games);
        }

        [HttpPost]
        [Route("GameNight/AddGame")]
        public async Task<IActionResult> AddGame([FromBody]GameNightGame game)
        {
            _gnContext.Games.Add(game);
            await _gnContext.SaveChangesAsync();
            return Ok();
        }

        [HttpGet]
        [Route("GameNight/GetGameNights/{startTime}/{length}")]
        public async Task<IActionResult> GetGameNights(long startTime, int length)
        { 
           return Ok(await _gnService.GetGameNights(DateTimeOffset.FromUnixTimeMilliseconds(startTime), length));
        }

        [HttpDelete]
        [Route("GameNight/SkipGameNight/{gameNightId}")]
        public async Task<IActionResult> SkipGameNight(int gameNightId)
        {
            await _gnService.SkipGameNight(gameNightId);
            return Ok();
        }

        [HttpDelete]
        [Route("GameNight/CancelGameNight/{gameNightId}")]
        public async Task<IActionResult> CancelGameNight(int gameNightId)
        {
            await _gnService.CancelGameNight(gameNightId);
            return Ok();
        }

        [HttpDelete]
        [Route("GameNight/UncancelGameNight/{gameNightId}")]
        public async Task<IActionResult> UncancelGameNight(int gameNightId)
        {
            await _gnService.UncancelGameNight(gameNightId);
            return Ok();
        }

        [HttpPost]
        [Route("GameNight/SaveGames")]
        public async Task<IActionResult> SaveGames([FromBody]GameNight gameNight)
        {
            await _gnService.SaveGames(gameNight);
            return Ok();
        }

        [HttpPost]
        [Route("GameNight/SaveMeal")]
        public async Task<IActionResult> SaveMeal([FromBody] GameNight gameNight)
        {
            await _gnService.SaveMeal(gameNight);
            return Ok();
        }

        private async Task ThrowIfGameNightDoesNotBelongToUser()
        {
            var currentUser = await GetCurrentUser();
            if (await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Guest.ToString()))
                throw new UnauthorizedException("Cannot make modifications as a guest");
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }

    }
}
