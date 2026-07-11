using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Portfolio.Data;
using Portfolio.Identity;
using Portfolio.Models.Auth;
using Portfolio.Models.Bowling;
using Portfolio.Models.Errors;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Portfolio.Controllers
{
    public class BowlingController : Controller
    {
        private static readonly string[] ValidRoles = new string[]
        {
            ApplicationRole.Administrator.ToString(),
            ApplicationRole.Bowler.ToString()
        };

        private readonly BowlingContext _bowlingContext;
        private readonly PortfolioContext _userContext;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<BowlingController> _logger;
        private readonly IBowlingDashboardService _dashboardService;

        public BowlingController(
            BowlingContext context,
            PortfolioContext userContext,
            UserManager<ApplicationUser> userManager,
            ILogger<BowlingController> logger,
            IBowlingDashboardService dashboardService)
        {
            _bowlingContext = context;
            _userContext = userContext;
            _userManager = userManager;
            _logger = logger;
            _dashboardService = dashboardService;
        }

        [HttpGet]
        [Route("Bowling/GetUsers")]
        public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
        {
            var validRoleIds = _userContext.Roles
                .AsNoTracking()
                .Where(role => ValidRoles.Contains(role.Name))
                .Select(role => role.Id);
            var validUserIds = _userContext.UserRoles
                .AsNoTracking()
                .Where(userRole => validRoleIds.Contains(userRole.RoleId))
                .Select(userRole => userRole.UserId);
            var validUsers = await _userContext.Users
                .AsNoTracking()
                .Where(user => validUserIds.Contains(user.Id))
                .ToListAsync(cancellationToken);

            _logger.LogDebug(
                "Found {UserCount} users that are in role(s) {ValidRoles}",
                validUsers.Count,
                string.Join(", ", ValidRoles));
            return Ok(validUsers.Select(user => user.AsClientUser()));
        }

        [HttpGet]
        [Route("Bowling/GetDashboard")]
        public async Task<IActionResult> GetDashboard(
            [FromQuery] BowlingDashboardRequest request,
            CancellationToken cancellationToken)
        {
            return Ok(await _dashboardService.GetDashboardAsync(request, cancellationToken));
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

        private async Task ThrowIfUserIsGuestAsync()
        {
            var currentUser = await GetCurrentUser();
            if (await _userManager.IsInRoleAsync(currentUser, ApplicationRole.Guest.ToString()))
                throw new UnauthorizedException("Cannot make modifications as a guest");
        }
    }
}
