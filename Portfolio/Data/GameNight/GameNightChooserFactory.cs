using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Portfolio.Data
{
    public class GameNightChooserFactory : IGameNightChooserFactory
    {
        private static readonly string[] DEFAULT_USER_ORDER = new string[] { "Nick", "Bash", "Ben", "Mom", "Sky" };
        private static readonly Dictionary<string, string> _userIdToNextUserId = new();

        public GameNightChooserFactory(IServiceScopeFactory scopeFactory) 
        {
            using var scope = scopeFactory.CreateScope();
            using var userContext = scope.ServiceProvider.GetRequiredService<PortfolioContext>();

            for (int i = 0; i < DEFAULT_USER_ORDER.Length; i++)
            {
                var currentUserName = DEFAULT_USER_ORDER[i];
                var nextUserName = DEFAULT_USER_ORDER[i == DEFAULT_USER_ORDER.Length - 1 ? 0 : i + 1];
                _userIdToNextUserId[GetUserId(currentUserName)] = GetUserId(nextUserName);
            }

            // Default user is whoever is first
            _userIdToNextUserId[string.Empty] = GetUserId(Environment.GetEnvironmentVariable("GAME_NIGHT_FIRST_USER_NAME") ?? DEFAULT_USER_ORDER.First());

            string GetUserId(string userName) => userContext.Users.Single(u => u.UserName.Equals(userName)).Id;
        }

        public string GetNextGameNightChooserId(string previousChooserId) => _userIdToNextUserId.TryGetValue(previousChooserId ?? string.Empty, out var uid) ? uid : null;
    }
}
