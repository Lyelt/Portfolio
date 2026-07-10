using Portfolio.Data;
using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portfolio.Identity
{
    public static class IdentityHelpers
    {
        private const string DefaultJwtAuthority = "https://ghobrial.dev";

        public const string UserIdClaim = "UserId";
        public static string ValidAudience => GetEnvironmentSetting("JWT_AUDIENCE", DefaultJwtAuthority);
        public static string ValidIssuer => GetEnvironmentSetting("JWT_ISSUER", DefaultJwtAuthority);

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

        private static string GetEnvironmentSetting(string name, string defaultValue)
        {
            var value = Environment.GetEnvironmentVariable(name);
            return string.IsNullOrWhiteSpace(value) ? defaultValue : value;
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
