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
using Portfolio.Models.Bowling;
using Portfolio.Models.Auth;

namespace Portfolio.Controllers
{
    public class BowlingController : Controller
    {
        private static string[] VALID_ROLES = new string[] { ApplicationRole.Administrator.ToString(), ApplicationRole.Bowler.ToString() };

        private readonly BowlingContext _bowlingContext;
        private readonly PortfolioContext _userContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<BowlingController> _logger;

        public BowlingController(BowlingContext context, PortfolioContext userContext, UserManager<ApplicationUser> userManager, ILogger<BowlingController> logger)
        {
            _bowlingContext = context;
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet]
        [Route("Bowling/GetUsers")]
        public IActionResult GetUsers()
        {
            try
            {
                List<ApplicationUser> validUsers = GetBowlers();
                _logger.LogDebug($"Found {validUsers.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
                return Ok(validUsers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining user information: {ex.Message}");
            }
        }

        private List<ApplicationUser> GetBowlers()
        {
            var validRoles = _userContext.Roles.Where(r => VALID_ROLES.Contains(r.Name));
            var validUserRoles = _userContext.UserRoles.Join(validRoles, ur => ur.RoleId, r => r.Id, (userRole, role) => userRole);
            var validUsers = _userContext.Users.Join(validUserRoles, u => u.Id, ur => ur.UserId, (user, userRole) => user).Distinct().ToList();
            return validUsers;
        }

        [HttpGet]
        [Route("Bowling/GetSessions")]
        public IActionResult GetSessions()
        {
            try
            {
                var sessions = GetSessionList();
                _logger.LogDebug($"Found {sessions.Count} total sessions.");
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining session information: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("Bowling/GetSeries/{seriesCategory}")]
        public IActionResult GetSeries(SeriesCategory seriesCategory)
        {
            try
            {
                var sessions = GetSessionList();
                var bowlers = GetBowlers();
                List<BowlingSeries> series = new BowlingSeriesService(sessions, bowlers).GetSeries(seriesCategory);
                _logger.LogDebug($"Retrieved {series.Count} series for category ${seriesCategory}");
                return Ok(series);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining series information: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("Bowling/GetStats/{statCategory}/{userId}/{startTime?}/{endTime?}")]
        public IActionResult GetStats(StatCategory statCategory, string userId, long? startTime, long? endTime)
        {
            try
            {
                var games = GetGames(userId, startTime, endTime);
                var calc = new BowlingStatCalculator(games);
                return Ok(calc.GetStats(statCategory));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while loading stats for user {userId}: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("Bowling/StartNewSession")]
        public async Task<IActionResult> StartNewSession([FromBody]BowlingSession session)
        {
            try
            {
                _logger.LogInformation($"Starting new session for {session.Date}");
                await _bowlingContext.Sessions.AddAsync(session);
                await _bowlingContext.SaveChangesAsync();
                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while starting new session: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("Bowling/AddGameToSession")]
        public async Task<IActionResult> AddGameToSession([FromBody]BowlingGame game)
        {
            try
            {
                _logger.LogInformation($"Adding game #{game.GameNumber} to session {game.BowlingSessionId}");
                foreach (var frame in game.Frames)
                    await _bowlingContext.Frames.AddAsync(frame);

                await _bowlingContext.Games.AddAsync(game);
                await _bowlingContext.SaveChangesAsync();
                _logger.LogDebug($"Added game with ID {game.Id} for user {game.UserId} with total score {game.TotalScore}.");
                return Ok(game);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while adding game to session: {ex.Message}");
            }
        }

        [HttpDelete]
        [Route("Bowling/DeleteGame/{gameId}")]
        public async Task<IActionResult> DeleteGame(int gameId)
        {
            try
            {
                _logger.LogInformation($"Deleting game {gameId}.");
                var game = await _bowlingContext.Games.FindAsync(gameId);

                var currentUser = await GetCurrentUser();
                bool userIsAdmin = await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Administrator.ToString());

                if (!userIsAdmin && currentUser.Id != game.UserId)
                    return Unauthorized();

                _bowlingContext.Games.Remove(game);
                await _bowlingContext.SaveChangesAsync();
                _logger.LogDebug($"Removed game with ID {game.Id} for user {game.UserId} in session {game.BowlingSessionId}.");
                return Ok(game);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while removing game {gameId}: {ex.Message}");
            }
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }

        private List<BowlingGame> GetGames(string userId, long? startTime, long? endTime)
        {
            var sessions = startTime.HasValue && endTime.HasValue ?
                GetSessionList().Where(s => s.Date > DateTimeOffset.FromUnixTimeMilliseconds(startTime.Value) && s.Date < DateTimeOffset.FromUnixTimeMilliseconds(endTime.Value)) :
                GetSessionList();

            return sessions
                  .SelectMany(s => s.Games.Where(g => g.UserId == userId))
                  .ToList();
        }

        private List<BowlingSession> GetSessionList()
        {
            var sessions = _bowlingContext
                    .Sessions
                    .Include(s => s.Games)
                    .ThenInclude(g => g.Frames)
                    .ToList();

            sessions.ForEach(s => s.Games = s.Games.OrderBy(g => g.GameNumber).ToList());

            return sessions;
        }
    }
}
