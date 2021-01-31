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
using Portfolio.Models.Errors;

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
            var validUsers = _userContext.GetValidUsersForRoles(VALID_ROLES);
            _logger.LogDebug($"Found {validUsers.Count} users that are in role(s) {string.Join(", ", VALID_ROLES)}");
            return Ok(validUsers);
        }

        [HttpGet]
        [Route("Bowling/GetSessions")]
        public IActionResult GetSessions()
        {
            var sessions = GetSessionList(null, null);
            _logger.LogDebug($"Found {sessions.Count} total sessions.");
            return Ok(sessions);
        }

        [HttpGet]
        [Route("Bowling/GetSeries/{seriesCategory}/{userId?}/{startTime?}/{endTime?}")]
        public IActionResult GetSeries(SeriesCategory seriesCategory, string userId = null, long? startTime = null, long? endTime = null)
        {
            var sessions = GetSessionList(startTime, endTime);
            var bowlers = _userContext.GetValidUsersForRoles(VALID_ROLES);//.Where(u => userId == null || u.Id == userId).ToList(); // TODO
            List<BowlingSeries> series = new BowlingSeriesService(sessions, bowlers).GetSeries(seriesCategory);
            _logger.LogDebug($"Retrieved {series.Count} series for category ${seriesCategory}");
            return Ok(series);
        }

        [HttpGet]
        [Route("Bowling/GetSingleSeries/{seriesCategory}/{userId}")]
        public IActionResult GetSingleSeries(SeriesCategory seriesCategory, string userId)
        {
            var games = GetGames(userId, null, null);

            // TODO: Use service for new category types and refactor to use a more elegant approach.
            var series = new List<SingleSeriesEntry>();
            var numberOfGamesPerScore = new Dictionary<int, int>();
            foreach (var game in games)
            {
                if (numberOfGamesPerScore.ContainsKey(game.TotalScore))
                    numberOfGamesPerScore[game.TotalScore]++;
                else
                    numberOfGamesPerScore[game.TotalScore] = 1;
            }

            foreach (var kvp in numberOfGamesPerScore)
                series.Add(new SingleSeriesEntry { Name = kvp.Key, Value = kvp.Value });

            _logger.LogDebug($"Retrieved {series.Count} series for category ${seriesCategory}");
            return Ok(series.OrderByDescending(g => g.Name));

        }

        [HttpGet]
        [Route("Bowling/GetStats/{statCategory}/{userId}/{startTime?}/{endTime?}")]
        public IActionResult GetStats(StatCategory statCategory, string userId, long? startTime, long? endTime)
        {
            var games = GetGames(userId, startTime, endTime);
            var calc = new BowlingStatCalculator(games);
            return Ok(calc.GetStats(statCategory));
        }

        [HttpPost]
        [Route("Bowling/StartNewSession")]
        public async Task<IActionResult> StartNewSession([FromBody] BowlingSession session)
        {
            await ThrowIfUserIsGuestAsync();

            _logger.LogInformation($"Starting new session for {session.Date}");
            await _bowlingContext.Sessions.AddAsync(session);
            await _bowlingContext.SaveChangesAsync();
            return Ok(session);
        }

        [HttpPost]
        [Route("Bowling/AddGameToSession")]
        public async Task<IActionResult> AddGameToSession([FromBody] BowlingGame game)
        {
            await ThrowIfUserIsGuestAsync();

            _logger.LogInformation($"Adding game #{game.GameNumber} to session {game.BowlingSessionId}");
            foreach (var frame in game.Frames)
                await _bowlingContext.Frames.AddAsync(frame);

            await _bowlingContext.Games.AddAsync(game);
            await _bowlingContext.SaveChangesAsync();
            _logger.LogDebug($"Added game with ID {game.Id} for user {game.UserId} with total score {game.TotalScore}.");
            return Ok(game);
        }

        [HttpDelete]
        [Route("Bowling/DeleteGame/{gameId}")]
        public async Task<IActionResult> DeleteGame(int gameId)
        {
            await ThrowIfUserIsGuestAsync();

            _logger.LogInformation($"Deleting game {gameId}.");
            var game = await _bowlingContext.Games.FindAsync(gameId);

            var currentUser = await GetCurrentUser();
            bool userIsAdmin = await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Administrator.ToString());

            if (!userIsAdmin && currentUser.Id != game.UserId)
                throw new UnauthorizedException("Cannot delete other users' games");

            _bowlingContext.Games.Remove(game);
            await _bowlingContext.SaveChangesAsync();
            _logger.LogDebug($"Removed game with ID {game.Id} for user {game.UserId} in session {game.BowlingSessionId}.");
            return Ok(game);
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
                    .AsEnumerable()
                    .Where(s => s.Date > DateTimeOffset.FromUnixTimeMilliseconds(startTime ?? 0) && (!endTime.HasValue || s.Date < DateTimeOffset.FromUnixTimeMilliseconds(endTime.Value)))
                    .ToList();

            sessions.ForEach(s => s.Games = s.Games.OrderBy(g => g.GameNumber).ToList());

            return sessions;
        }

        private async Task ThrowIfUserIsGuestAsync()
        {
            var currentUser = await GetCurrentUser();
            if (await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Guest.ToString()))
                throw new UnauthorizedException("Cannot make modifications as a guest");
        }
    }
}
