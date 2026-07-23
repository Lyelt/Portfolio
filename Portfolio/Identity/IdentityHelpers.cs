using Portfolio.Data;
using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Portfolio.Identity
{
    public static class IdentityHelpers
    {
        public const string UserIdClaim = "UserId";
        public static string ValidAudience => GetRequiredEnvironmentSetting("JWT_AUDIENCE");
        public static string ValidIssuer => GetRequiredEnvironmentSetting("JWT_ISSUER");

        public static string JwtSecurityKey
        {
            get
            {
                var value = Environment.GetEnvironmentVariable("JWT_SECURITY_KEY");
                if (string.IsNullOrWhiteSpace(value))
                    throw new InvalidOperationException("Required environment variable JWT_SECURITY_KEY is not set.");
                if (Encoding.UTF8.GetByteCount(value) < 32)
                    throw new InvalidOperationException("JWT_SECURITY_KEY must contain at least 32 UTF-8 bytes for HS256.");

                return value;
            }
        }

        private static string GetRequiredEnvironmentSetting(string name)
        {
            var value = Environment.GetEnvironmentVariable(name);
            if (string.IsNullOrWhiteSpace(value))
                throw new InvalidOperationException($"Required environment variable {name} is not set.");

            return value;
        }

        public static List<ApplicationUser> GetValidUsersForRoles(this PortfolioContext context, params string[] validRoleNames)
        {
            var validRoleIds = context.Roles.Where(r => validRoleNames.Contains(r.Name)).Select(r => r.Id).ToList();
            var validUserIds = context.UserRoles.Where(ur => validRoleIds.Contains(ur.RoleId)).Select(ur => ur.UserId).ToList();
            return context.Users.Where(u => validUserIds.Contains(u.Id)).ToList();
        }
    }

    public enum ApplicationRole
    {
        Administrator,
        Speedrunner,
        Bowler,
        Duelist,
        DogOwner,
        Gamer,
        Chef,
        Guest
    }
}
