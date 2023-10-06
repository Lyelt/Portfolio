using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;

namespace Portfolio.Data
{
    public class GameNightChooserFactory : IGameNightChooserFactory
    {
        private static string[] DEFAULT_USER_ORDER = new string[] { "Nick", "Bash", "Ben", "Mom", "Sky" };
        private static Dictionary<string, string> _userIdToNextUserId = new Dictionary<string, string>();

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
            _userIdToNextUserId[string.Empty] = GetUserId(Environment.GetEnvironmentVariable("GAME_NIGHT_FIRST_USER_NAME"));

            string GetUserId(string userName) => userContext.Users.Single(u => u.UserName.Equals(userName)).Id;
        }

        public string GetNextGameNightChooserId(string previousChooserId) => _userIdToNextUserId.TryGetValue(previousChooserId ?? string.Empty, out var uid) ? uid : null;
    }
}
