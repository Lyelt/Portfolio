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

        public GameNightController(GameNightContext context, PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<GameNightController> logger)
        {
            _gnContext = context;
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet]
        [Route("GameNight/GetUsers")]
        public IActionResult GetUsers()
        {
            var speedrunners = _userContext.GetValidUsersForRoles(VALID_ROLES);
            _logger.LogDebug($"Found {speedrunners.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
            return Ok(speedrunners);
        }

        [HttpGet]
        [Route("GameNight/GetGames")]
        public IActionResult GetGames()
        {
            List<GameNightGame> games = _gnContext.Games.ToList();
            _logger.LogDebug($"Found {games.Count} total games.");
            return Ok(games);
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }
    }
}
