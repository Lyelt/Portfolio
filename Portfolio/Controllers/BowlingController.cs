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
                List<ApplicationUser> validUsers = _userContext.GetValidUsersForRoles(VALID_ROLES);
                _logger.LogDebug($"Found {validUsers.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
                return Ok(validUsers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining user information.");
            }
        }

        [HttpGet]
        [Route("Bowling/GetSessions")]
        public IActionResult GetSessions()
        {
            try
            {
                var sessions = GetSessionList(null, null);
                _logger.LogDebug($"Found {sessions.Count} total sessions.");
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining bowling session information.");
            }
        }

        [HttpGet]
        [Route("Bowling/GetSeries/{seriesCategory}/{startTime?}/{endTime?}")]
        public IActionResult GetSeries(SeriesCategory seriesCategory, long? startTime = null, long? endTime = null)
        {
            try
            {
                var sessions = GetSessionList(startTime, endTime);
                var bowlers = _userContext.GetValidUsersForRoles(VALID_ROLES);
                List<BowlingSeries> series = new BowlingSeriesService(sessions, bowlers).GetSeries(seriesCategory);
                _logger.LogDebug($"Retrieved {series.Count} series for category ${seriesCategory}");
                return Ok(series);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining bowling series information.");
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
                return NotFound($"Error while loading \"{statCategory}\" bowling stats.");
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
                return BadRequest($"Error while initializing new bowling session.");
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
                return BadRequest($"Error while adding new game to session.");
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
                return BadRequest($"Error while deleting bowling game.");
            }
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }

        private List<BowlingGame> GetGames(string userId, long? startTime, long? endTime)
        {
            var sessions = GetSessionList(startTime, endTime);

            return sessions
                  .SelectMany(s => s.Games.Where(g => g.UserId == userId))
                  .ToList();
        }

        private List<BowlingSession> GetSessionList(long? startTime, long? endTime)
        {
            var sessions = _bowlingContext
                    .Sessions
                    .Include(s => s.Games)
                    .ThenInclude(g => g.Frames)
                    .Where(s => s.Date > DateTimeOffset.FromUnixTimeMilliseconds(startTime ?? 0) && 
                                s.Date < DateTimeOffset.FromUnixTimeMilliseconds(endTime ?? new DateTimeOffset(DateTime.Now.AddYears(999)).ToUnixTimeMilliseconds()))
                    .ToList();

            sessions.ForEach(s => s.Games = s.Games.OrderBy(g => g.GameNumber).ToList());

            return sessions;
        }
    }
}
