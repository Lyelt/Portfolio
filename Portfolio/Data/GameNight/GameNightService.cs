﻿using Microsoft.EntityFrameworkCore;
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

        public async Task SaveGames(GameNight newGameNight)
        {
            var gn = await _context.GameNights
                      .Include(g => g.Games)
                      .FirstOrDefaultAsync(g => g.Id == newGameNight.Id);

            gn.Games.RemoveAll(game => !newGameNight.Games.Any(newGame => newGame.Id == game.Id));

            foreach (var newGame in newGameNight.Games)
            {
                if (!gn.Games.Any(game => game.Id == newGame.Id))
                {
                    gn.Games.Add(newGame);
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task SaveMeal(GameNight gameNight)
        {
            var gn = await _context.GameNights.FindAsync(gameNight.Id);
            (gn.GameNightMealId, gn.Meal) = (gameNight.GameNightMealId, gameNight.Meal);
            await _context.SaveChangesAsync();
        }

        public async Task SaveUserStatus(GameNightUserStatus status)
        {
            var gn = await _context.GameNights.FindAsync(status.GameNight.Id);
            var existingStatus = gn.UserStatuses.FirstOrDefault(u => u.Id == status.Id);
            if (existingStatus is GameNightUserStatus) 
            {
                existingStatus.Status = status.Status;
            }
            else
            {
                gn.UserStatuses.Add(status);
            }

            await _context.SaveChangesAsync();
        }

        public async Task SkipGameNight(int gameNightId)
        {
            var gameNight = await _context.GameNights.FindAsync(gameNightId);
            var nextGameNight = await GetNextGameNightFrom(gameNight); 
            nextGameNight ??= await CreateNextGameNightFrom(gameNight);

            // Need to do this again in the case where the skipped game night doesn't have another night created after it
            // Otherwise, we'd end up using the wrong user for the week after the skipped game
            var followingGameNight = GetNextGameNightFrom(nextGameNight);
            if (followingGameNight == null)
                await CreateNextGameNightFrom(nextGameNight);

            // Effectively "skip" this game night by swapping its date with the next one
            (nextGameNight.Date, gameNight.Date) = (gameNight.Date, nextGameNight.Date);
            await _context.SaveChangesAsync();
        }

        public async Task CancelGameNight(int gameNightId)
        {
            var gameNight = await _context.GameNights.FindAsync(gameNightId);
            // "Cancel" this game night by replacing it with a cancelled game night on the same day
            var cancelledGameNight = gameNight.GetCancelledCopy();
            _context.GameNights.Add(cancelledGameNight);

            // ...then push everything to the next available slot
            var gameNights = GetAllGameNightsFrom(gameNight).ToList();
            foreach (var gn in gameNights)
            {
                gn.Date = FindNextAvailableGameNightDate(gn.Date);
            }

            await _context.SaveChangesAsync();
        }

        public async Task UncancelGameNight(int gameNightId)
        {
            var gameNight = await _context.GameNights.FindAsync(gameNightId);
            var gameNights = GetAllGameNightsFrom(gameNight).SkipWhile(gn => gn.Id == gameNightId).Where(gn => !(gn.IsCancelled ?? false)).ToList();

            for (var i = 1; i < gameNights.Count; i++)
            {
                gameNights[i].Date = gameNights[i -1].Date;
            }

            var gameNightToReinstate = gameNights.FirstOrDefault() ?? await CreateNextGameNightFrom(gameNight);
            gameNightToReinstate.Date = gameNight.Date;
            
            // Delete the cancelled game night
            _context.GameNights.Remove(gameNight);
            await _context.SaveChangesAsync();
        }


        private async Task<GameNight> CreateNextGameNightFrom(GameNight previousGameNight)
        {
            var gn = new GameNight { Date = GetNextDateFrom(previousGameNight?.Date ?? DateTime.UtcNow), UserId = GetNextUserIdFrom(previousGameNight?.UserId) };
            await _context.GameNights.AddAsync(gn);
            await _context.SaveChangesAsync();
            _logger.LogInformation($"Automatically added next game night: {gn.UserId}'s night on {gn.Date}");
            return gn;

            DateTime GetNextDateFrom(DateTime startDate)
            {
                var daysUntilNextGameNight = (7 - (int)startDate.DayOfWeek + (int)DEFAULT_GAME_NIGHT) % 7;
                return startDate.AddDays(daysUntilNextGameNight == 0 ? 7 : daysUntilNextGameNight); // 0 means same day, so add a week
            }

            string GetNextUserIdFrom(string userId) => _gameNightChooser.GetNextGameNightChooserId(userId);
        }

        private IEnumerable<GameNight> GetAllGameNightsFrom(GameNight gameNight)
        {
            return _context.GameNights
                .AsEnumerable()
                .OrderBy(gn => gn.Date)
                .Where(gn => gn.Date >= gameNight.Date);
        }

        private DateTime FindNextAvailableGameNightDate(DateTime startDate)
        {
            var gameNights = _context.GameNights
                .AsEnumerable()
                .OrderBy(gn => gn.Date);

            return gameNights
                .FirstOrDefault(gn => !(gn.IsCancelled ?? false) && gn.Date > startDate)?.Date 
                ?? gameNights.Last().Date.AddDays(7);
        }

        private async Task<GameNight> GetNextGameNightFrom(GameNight gameNight)
        {
            return GetAllGameNightsFrom(gameNight)
                .Skip(1)
                .FirstOrDefault(gn => !(gn.IsCancelled ?? false)) ?? await CreateNextGameNightFrom(gameNight);
        }

        private GameNight GetPreviousGameNightFrom(GameNight gameNight)
        {
            return _context.GameNights
                .AsEnumerable()
                .OrderByDescending(gn => gn.Date)
                .Where(gn => gn.Date < gameNight.Date)
                .FirstOrDefault(gn => !(gn.IsCancelled ?? false));
        }
    }
}
