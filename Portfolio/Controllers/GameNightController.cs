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
            return Ok(_gnService.SkipGameNight(await _gnContext.GameNights.FindAsync(gameNightId)));
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }
    }
}
