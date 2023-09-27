using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Portfolio.Models.GameNight;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public class GameNightService : IGameNightService
    {
        private const DayOfWeek DEFAULT_GAME_NIGHT = DayOfWeek.Monday;
        private readonly GameNightContext _context;
        private readonly IGameNightChooserFactory _gameNightChooser;
        private readonly ILogger<GameNightService> _logger;

        public GameNightService(ILogger<GameNightService> logger, GameNightContext gameNightContext, IGameNightChooserFactory gameNightChooser) 
        { 
            _logger = logger;
            _context = gameNightContext;
            _gameNightChooser = gameNightChooser;
        }

        public async Task<IEnumerable<GameNight>> GetGameNights(DateTimeOffset startDate, int numberOfGameNights)
        {
            var gameNights = _context.GameNights
                .Include(gn => gn.Games)
                .Include(gn => gn.Meal)
                .Include(gn => gn.User)
                .AsEnumerable()
                .OrderBy(gn => gn.Date)
                .SkipWhile(gn => gn.Date.Date < startDate.Date)
                .Take(numberOfGameNights)
                .ToList();

            while (gameNights.Count < numberOfGameNights)
            {
                gameNights.Add(await CreateNextGameNightFrom(gameNights.LastOrDefault()));
            }

            return gameNights;
        }

        public async Task SkipGameNight(GameNight gameNight)
        {
            var nextGameNight = GetNextGameNightFrom(gameNight); 
            nextGameNight ??= await CreateNextGameNightFrom(gameNight);

            // Need to do this again in the case where the skipped game night doesn't have another night created after it
            // Otherwise, we'd end up using the wrong user for the week after the skipped game
            var followingGameNight = GetNextGameNightFrom(nextGameNight);
            if (followingGameNight == null)
                await CreateNextGameNightFrom(nextGameNight);

            // Effectively "skip" this game night by swappings its date with the next one
            (nextGameNight.Date, gameNight.Date) = (gameNight.Date, nextGameNight.Date);
            await _context.SaveChangesAsync();
        }

        private async Task<GameNight> CreateNextGameNightFrom(GameNight previousGameNight)
        {
            var gn = new GameNight { Date = GetNextDateFrom(previousGameNight?.Date ?? DateTime.UtcNow), UserId = GetNextUserIdFrom(previousGameNight?.UserId) };
            await _context.GameNights.AddAsync(gn);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Automatically added next game night: {gn.UserId}'s night on {gn.Date}");
            return gn;
        }

        private DateTime GetNextDateFrom(DateTime startDate)
        {
            var daysUntilNextGameNight = (7 - (int)startDate.DayOfWeek + (int)DEFAULT_GAME_NIGHT) % 7;
            return startDate.AddDays(daysUntilNextGameNight == 0 ? 7 : daysUntilNextGameNight); // 0 means same day, so add a week
        } 
        
        private string GetNextUserIdFrom(string userId) => _gameNightChooser.GetNextGameNightChooserId(userId);

        private GameNight GetNextGameNightFrom(GameNight gameNight)
        {
            return _context.GameNights
                .AsEnumerable()
                .OrderBy(gn => gn.Date)
                .FirstOrDefault(gn => gn.Date > gameNight.Date);
        }
    }
}
