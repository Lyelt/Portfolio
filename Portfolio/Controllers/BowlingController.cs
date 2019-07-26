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
        [Route("Bowling/GetSessions")]
        public IActionResult GetSessions()
        {
            try
            {
                List<BowlingSession> sessions = _bowlingContext
                    .Sessions
                    .Include(s => s.Games)
                    .ThenInclude(g => g.Frames)
                    .ToList();

                _logger.LogDebug($"Found {sessions.Count} total courses.");
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return NotFound($"Error while obtaining session information: {ex.Message}");
            }
        }

        [HttpGet]
        [Route("Bowling/GetOverallStats/{userId}")]
        public IActionResult GetOverallStats(string userId)
        {
            try
            {
                var sessions = _bowlingContext
                    .Sessions
                    .Include(s => s.Games)
                    .ThenInclude(g => g.Frames)
                    .ToList();

                var games = sessions.SelectMany(s => s.Games.Where(g => g.UserId == userId))
                    .ToList();

                var calc = new BowlingStatCalculator(games);
                return Ok(calc.GetOverallStats());
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
                await _bowlingContext.Sessions.AddAsync(session);
                await _bowlingContext.SaveChangesAsync();
                return Ok();
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
                var currentUser = await GetCurrentUser();
                game.UserId = currentUser.Id;

                foreach (var frame in game.Frames)
                    await _bowlingContext.Frames.AddAsync(frame);

                await _bowlingContext.Games.AddAsync(game);
                await _bowlingContext.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.ToString());
                return BadRequest($"Error while adding game to session: {ex.Message}");
            }
        }

        private async Task<ApplicationUser> GetCurrentUser()
        {
            return await _userManager.GetUserAsync(User);
        }
    }
}
