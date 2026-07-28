using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Portfolio.Identity;
using Portfolio.Models.Bowling;
using Portfolio.Models.Errors;
using System;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public interface IBowlingDashboardService
    {
        Task<BowlingDashboard> GetDashboardAsync(BowlingDashboardRequest request, CancellationToken cancellationToken);
    }

    public sealed class BowlingDashboardService : IBowlingDashboardService
    {
        private static readonly string[] ValidRoles = new string[]
        {
            ApplicationRole.Administrator.ToString(),
            ApplicationRole.Bowler.ToString()
        };

        private static readonly DateTime LeagueStart = new DateTime(2019, 8, 27);

        private readonly BowlingContext _bowlingContext;
        private readonly PortfolioContext _userContext;
        private readonly ILogger<BowlingDashboardService> _logger;

        public BowlingDashboardService(
            BowlingContext bowlingContext,
            PortfolioContext userContext,
            ILogger<BowlingDashboardService> logger)
        {
            _bowlingContext = bowlingContext;
            _userContext = userContext;
            _logger = logger;
        }

        public async Task<BowlingDashboard> GetDashboardAsync(
            BowlingDashboardRequest request,
            CancellationToken cancellationToken)
        {
            ValidateRequest(request);
            var stopwatch = Stopwatch.StartNew();
            var startDate = FromUnixTimeMilliseconds(request.StartTime, nameof(request.StartTime));
            var endDate = FromUnixTimeMilliseconds(request.EndTime, nameof(request.EndTime));

            var query = _bowlingContext.Sessions
                .AsNoTracking()
                .Where(session => session.Games.Any(game => game.UserId == request.UserId));

            if (startDate.HasValue)
                query = query.Where(session => session.Date > startDate.Value);

            if (endDate.HasValue)
                query = query.Where(session => session.Date < endDate.Value);

            if (request.LeagueMatchesOnly)
            {
                query = query.Where(session =>
                    session.Date.DayOfWeek == DayOfWeek.Wednesday &&
                    session.Date > LeagueStart &&
                    session.Games.Count(game => game.UserId == request.UserId) == 3);
            }

            var sessions = await query
                .OrderBy(session => session.Date)
                .Include(session => session.Games
                    .Where(game => game.UserId == request.UserId)
                    .OrderBy(game => game.GameNumber))
                .ThenInclude(game => game.Frames)
                .AsSplitQuery()
                .ToListAsync(cancellationToken);

            foreach (var session in sessions)
            {
                session.Games = session.Games.OrderBy(game => game.GameNumber).ToList();
                foreach (var game in session.Games)
                {
                    game.Session = session;
                    game.Frames = game.Frames.OrderBy(frame => frame.FrameNumber).ToList();
                }
            }

            var validRoleIds = _userContext.Roles
                .AsNoTracking()
                .Where(role => ValidRoles.Contains(role.Name))
                .Select(role => role.Id);
            var validUserIds = _userContext.UserRoles
                .AsNoTracking()
                .Where(userRole => validRoleIds.Contains(userRole.RoleId))
                .Select(userRole => userRole.UserId);
            var bowlers = await _userContext.Users
                .AsNoTracking()
                .Where(user => user.Id == request.UserId && validUserIds.Contains(user.Id))
                .ToListAsync(cancellationToken);

            cancellationToken.ThrowIfCancellationRequested();
            var games = sessions.SelectMany(session => session.Games).ToList();
            var series = new BowlingSeriesService(sessions, bowlers).GetSeries(request.SeriesCategory);
            var stats = new BowlingStatCalculator(games).GetStats(request.StatCategory);

            _logger.LogInformation(
                "Loaded Bowling dashboard for user {UserId} with {SessionCount} sessions, {GameCount} games, and {FrameCount} frames in {LoadDuration}",
                request.UserId,
                sessions.Count,
                games.Count,
                games.Sum(game => game.Frames.Count),
                stopwatch.Elapsed);

            return new BowlingDashboard
            {
                Sessions = sessions,
                Series = series,
                Stats = stats
            };
        }

        private static void ValidateRequest(BowlingDashboardRequest request)
        {
            if (request == null)
                throw new BadRequestException("Bowling dashboard filters are required.");

            if (string.IsNullOrWhiteSpace(request.UserId))
                throw new BadRequestException("A bowler is required.");

            if (!Enum.IsDefined(request.SeriesCategory))
                throw new BadRequestException("The series category is invalid.");

            if (!Enum.IsDefined(request.StatCategory))
                throw new BadRequestException("The statistics category is invalid.");

            if (request.StartTime.HasValue && request.EndTime.HasValue && request.StartTime > request.EndTime)
                throw new BadRequestException("The Bowling start time must not be after the end time.");
        }

        private static DateTime? FromUnixTimeMilliseconds(long? value, string fieldName)
        {
            if (!value.HasValue)
                return null;

            try
            {
                return DateTimeOffset.FromUnixTimeMilliseconds(value.Value).DateTime;
            }
            catch (ArgumentOutOfRangeException)
            {
                throw new BadRequestException($"The Bowling {fieldName} value is invalid.");
            }
        }
    }
}
