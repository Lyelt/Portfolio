using Microsoft.AspNetCore.Identity;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging.Abstractions;
using Portfolio.Data;
using Portfolio.Identity;
using Portfolio.Models.Auth;
using Portfolio.Models.Bowling;
using System.Data.Common;

namespace Portfolio.Tests;

public sealed class BowlingDashboardServiceTests : IDisposable
{
    private const string BowlerId = "bowler-1";
    private const string OtherUserId = "bowler-2";

    private readonly SqliteConnection _bowlingConnection;
    private readonly SqliteConnection _userConnection;
    private readonly RecordingCommandInterceptor _commands = new RecordingCommandInterceptor();
    private readonly BowlingContext _bowlingContext;
    private readonly PortfolioContext _userContext;
    private int _nextGameId = 1;
    private int _nextFrameId = 1;

    public BowlingDashboardServiceTests()
    {
        _bowlingConnection = new SqliteConnection("Data Source=:memory:");
        _bowlingConnection.Open();
        _userConnection = new SqliteConnection("Data Source=:memory:");
        _userConnection.Open();

        _bowlingContext = new BowlingContext(
            new DbContextOptionsBuilder<BowlingContext>()
                .UseSqlite(_bowlingConnection)
                .AddInterceptors(_commands)
                .Options);
        _userContext = new PortfolioContext(
            new DbContextOptionsBuilder<PortfolioContext>()
                .UseSqlite(_userConnection)
                .Options);

        _bowlingContext.Database.EnsureCreated();
        _userContext.Database.EnsureCreated();
        SeedUsers();
        SeedBowlingData();
        _bowlingContext.ChangeTracker.Clear();
        _userContext.ChangeTracker.Clear();
        _commands.Clear();
    }

    [Fact]
    public async Task DashboardFiltersInSqlAndReturnsMatchingSessionsSeriesAndStats()
    {
        var dashboard = await CreateService().GetDashboardAsync(new BowlingDashboardRequest
        {
            UserId = BowlerId,
            LeagueMatchesOnly = true,
            StartTime = ToUnixTimeMilliseconds(new DateTime(2024, 1, 1)),
            EndTime = ToUnixTimeMilliseconds(new DateTime(2024, 2, 1)),
            SeriesCategory = SeriesCategory.SessionAverage,
            StatCategory = StatCategory.Overall
        }, CancellationToken.None);

        var session = Assert.Single(dashboard.Sessions);
        Assert.Equal(new DateTime(2024, 1, 3), session.Date);
        Assert.Equal(3, session.Games.Count);
        Assert.All(session.Games, game => Assert.Equal(BowlerId, game.UserId));
        Assert.Equal(30, session.Games.Sum(game => game.Frames.Count));

        var series = Assert.Single(dashboard.Series);
        Assert.Equal("Test Bowler", series.Name);
        Assert.Equal(160, Assert.Single(series.Series).Value);
        Assert.Equal(160, dashboard.Stats.Single(stat => stat.Name == "Average").Value);
        Assert.Equal(3, dashboard.Stats.Single(stat => stat.Name == "Games").Value);

        var sessionQueries = _commands.Commands
            .Where(command => command.Contains("BowlingSessions", StringComparison.Ordinal))
            .ToList();
        Assert.NotEmpty(sessionQueries);
        Assert.All(sessionQueries, command =>
        {
            Assert.Contains("WHERE", command, StringComparison.OrdinalIgnoreCase);
            Assert.Contains("UserId", command, StringComparison.Ordinal);
            Assert.Contains("Date", command, StringComparison.Ordinal);
        });
        Assert.Empty(_bowlingContext.ChangeTracker.Entries());
        Assert.Empty(_userContext.ChangeTracker.Entries());
    }

    [Fact]
    public async Task GameSeriesDoesNotMutateReturnedSessionDates()
    {
        var expectedDate = new DateTime(2024, 1, 3);
        var dashboard = await CreateService().GetDashboardAsync(new BowlingDashboardRequest
        {
            UserId = BowlerId,
            LeagueMatchesOnly = true,
            StartTime = ToUnixTimeMilliseconds(new DateTime(2024, 1, 1)),
            EndTime = ToUnixTimeMilliseconds(new DateTime(2024, 2, 1)),
            SeriesCategory = SeriesCategory.Game,
            StatCategory = StatCategory.Overall
        }, CancellationToken.None);

        Assert.Equal(expectedDate, Assert.Single(dashboard.Sessions).Date);
        var entries = Assert.Single(dashboard.Series).Series;
        Assert.Equal(3, entries.Count);
        Assert.Equal(expectedDate.AddHours(1), entries[0].Name);
        Assert.Equal(expectedDate.AddHours(3), entries[2].Name);
    }

    [Fact]
    public async Task FutureRangeReturnsEmptyDashboardWithoutUnfilteredFrameQuery()
    {
        _commands.Clear();
        var dashboard = await CreateService().GetDashboardAsync(new BowlingDashboardRequest
        {
            UserId = BowlerId,
            LeagueMatchesOnly = false,
            StartTime = ToUnixTimeMilliseconds(new DateTime(2030, 1, 1)),
            EndTime = ToUnixTimeMilliseconds(new DateTime(2030, 2, 1)),
            SeriesCategory = SeriesCategory.SessionAverage,
            StatCategory = StatCategory.Record
        }, CancellationToken.None);

        Assert.Empty(dashboard.Sessions);
        Assert.Empty(dashboard.Series);
        Assert.Equal(4, dashboard.Stats.Count);
        Assert.All(dashboard.Stats, stat => Assert.Equal(0, stat.Value));

        var bowlingQueries = _commands.Commands
            .Where(command => command.Contains("Bowling", StringComparison.Ordinal))
            .ToList();
        Assert.NotEmpty(bowlingQueries);
        Assert.All(bowlingQueries, command => Assert.Contains("Date", command, StringComparison.Ordinal));
    }

    [Fact]
    public async Task CanceledDashboardRequestStopsAsyncDatabaseWork()
    {
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            CreateService().GetDashboardAsync(new BowlingDashboardRequest
            {
                UserId = BowlerId,
                LeagueMatchesOnly = false,
                SeriesCategory = SeriesCategory.SessionAverage,
                StatCategory = StatCategory.Overall
            }, cancellation.Token));
    }

    public void Dispose()
    {
        _bowlingContext.Dispose();
        _userContext.Dispose();
        _bowlingConnection.Dispose();
        _userConnection.Dispose();
    }

    private BowlingDashboardService CreateService() => new BowlingDashboardService(
        _bowlingContext,
        _userContext,
        NullLogger<BowlingDashboardService>.Instance);

    private void SeedUsers()
    {
        const string roleId = "bowler-role";
        _userContext.Roles.Add(new IdentityRole
        {
            Id = roleId,
            Name = ApplicationRole.Bowler.ToString(),
            NormalizedName = ApplicationRole.Bowler.ToString().ToUpperInvariant()
        });
        _userContext.Users.Add(new ApplicationUser
        {
            Id = BowlerId,
            UserName = "Test Bowler",
            NormalizedUserName = "TEST BOWLER"
        });
        _userContext.UserRoles.Add(new IdentityUserRole<string>
        {
            RoleId = roleId,
            UserId = BowlerId
        });
        _userContext.SaveChanges();
    }

    private void SeedBowlingData()
    {
        _bowlingContext.Set<ApplicationUser>().AddRange(
            new ApplicationUser { Id = BowlerId, UserName = "Test Bowler" },
            new ApplicationUser { Id = OtherUserId, UserName = "Other Bowler" });
        var matchingLeagueSession = CreateSession(
            1,
            new DateTime(2024, 1, 3),
            (BowlerId, 3, 150),
            (OtherUserId, 1, 100));
        var nonLeagueSession = CreateSession(
            2,
            new DateTime(2024, 1, 10),
            (BowlerId, 2, 120));
        var outsideDateRange = CreateSession(
            3,
            new DateTime(2023, 1, 4),
            (BowlerId, 3, 90));

        _bowlingContext.Sessions.AddRange(matchingLeagueSession, nonLeagueSession, outsideDateRange);
        _bowlingContext.SaveChanges();
    }

    private BowlingSession CreateSession(
        int id,
        DateTime date,
        params (string UserId, int GameCount, int StartingScore)[] bowlers)
    {
        var session = new BowlingSession
        {
            Id = id,
            Date = date,
            Games = new List<BowlingGame>()
        };

        foreach (var bowler in bowlers)
        {
            for (var gameNumber = 1; gameNumber <= bowler.GameCount; gameNumber++)
            {
                session.Games.Add(new BowlingGame
                {
                    Id = _nextGameId++,
                    BowlingSessionId = id,
                    GameNumber = gameNumber,
                    UserId = bowler.UserId,
                    TotalScore = bowler.StartingScore + ((gameNumber - 1) * 10),
                    Frames = Enumerable.Range(1, 10)
                        .Select(frameNumber => new BowlingFrame
                        {
                            Id = _nextFrameId++,
                            FrameNumber = frameNumber,
                            Roll1Score = frameNumber % 2 == 0 ? 10 : 9,
                            Roll2Score = frameNumber % 2 == 0 ? 0 : 1,
                            Roll3Score = 0,
                            IsSplit = false
                        })
                        .ToList()
                });
            }
        }

        return session;
    }

    private static long ToUnixTimeMilliseconds(DateTime value) =>
        new DateTimeOffset(DateTime.SpecifyKind(value, DateTimeKind.Utc)).ToUnixTimeMilliseconds();

    private sealed class RecordingCommandInterceptor : DbCommandInterceptor
    {
        public List<string> Commands { get; } = new List<string>();

        public void Clear() => Commands.Clear();

        public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
            DbCommand command,
            CommandEventData eventData,
            InterceptionResult<DbDataReader> result,
            CancellationToken cancellationToken = default)
        {
            Commands.Add(command.CommandText);
            return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
        }
    }
}
