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
using System.Data;

namespace Portfolio.Controllers
{
    public class GameNightController : Controller
    {
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
        [Route("GameNight/GetGames")]
        public IActionResult GetGames()
        {
            List<GameNightGame> games = _gnContext.Games.ToList();
            _logger.LogDebug($"Found {games.Count} total games.");
            return Ok(games);
        }

        [HttpGet]
        [Route("GameNight/GetMeals")]
        public IActionResult GetMeals()
        {
            List<GameNightMeal> meals = _gnContext.GameNightMeals.OrderBy(gnm => gnm.DateAdded).ToList();
            return Ok(meals);
        }

        [HttpPost]
        [Route("GameNight/AddGame")]
        public async Task<IActionResult> AddGame([FromBody]GameNightGame game)
        {
            await ThrowIfUserNotInRole(ApplicationRole.Gamer);
            _gnContext.Games.Add(game);
            await _gnContext.SaveChangesAsync();
            return Ok();
        }

        [HttpPost]
        [Route("GameNight/AddMeal")]
        public async Task<IActionResult> AddMeal([FromBody] GameNightMeal meal)
        {
            await ThrowIfUserNotInRole(ApplicationRole.Gamer);
            meal.DateAdded = DateTime.Now;
            _gnContext.GameNightMeals.Add(meal);
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
            await ThrowIfUserNotInRole(ApplicationRole.Gamer);
            await ThrowIfGameNightDoesNotBelongToUser(_gnContext.GameNights.Find(gameNightId));
            await _gnService.SkipGameNight(gameNightId);
            return Ok();
        }

        [HttpDelete]
        [Route("GameNight/CancelGameNight/{gameNightId}")]
        public async Task<IActionResult> CancelGameNight(int gameNightId)
        {
            await ThrowIfUserNotInRole(ApplicationRole.Gamer);
            await ThrowIfGameNightDoesNotBelongToUser(_gnContext.GameNights.Find(gameNightId));
            await _gnService.CancelGameNight(gameNightId);
            return Ok();
        }

        [HttpDelete]
        [Route("GameNight/UncancelGameNight/{gameNightId}")]
        public async Task<IActionResult> UncancelGameNight(int gameNightId)
        {
            await ThrowIfUserNotInRole(ApplicationRole.Gamer);
            await ThrowIfGameNightDoesNotBelongToUser(_gnContext.GameNights.Find(gameNightId));
            await _gnService.UncancelGameNight(gameNightId);
            return Ok();
        }

        [HttpPost]
        [Route("GameNight/SaveGames")]
        public async Task<IActionResult> SaveGames([FromBody]GameNight gameNight)
        {
            await ThrowIfUserNotInRole(ApplicationRole.Gamer);
            await _gnService.SaveGames(gameNight);
            return Ok();
        }

        [HttpPost]
        [Route("GameNight/SaveMeal")]
        public async Task<IActionResult> SaveMeal([FromBody] GameNight gameNight)
        {
            await ThrowIfUserNotInRole(ApplicationRole.Chef);
            await _gnService.SaveMeal(gameNight);
            return Ok();
        }

        [HttpPost]
        [Route("GameNight/SaveUserStatus")]
        public async Task<IActionResult> SaveUserStatus([FromBody] GameNightUserStatus status)
        {
            await ThrowIfUserNotInRole(ApplicationRole.Gamer);
            await _gnService.SaveUserStatus(status);
            return Ok();
        }

        private async Task ThrowIfGameNightDoesNotBelongToUser(GameNight gn)
        {
            var currentUser = await GetCurrentUser();
            if (!(gn.UserId?.Equals(currentUser.Id) ?? true))
                throw new UnauthorizedException("This game night does not belong to you");
        }

        private async Task ThrowIfUserNotInRole(ApplicationRole role)
        {
            var currentUser = await GetCurrentUser();
            if (!(await _userManager.IsInRoleAsync(currentUser, role.ToString())))
                throw new UnauthorizedException("You do not have the required permission to do that");
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }

    }
}
