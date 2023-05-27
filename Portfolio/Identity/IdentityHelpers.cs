using Portfolio.Data;
using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Identity
{
    public static class IdentityHelpers
    {
        public static string UserIdClaim = "UserId";
        public static string ValidAudience = "https://ghobrial.dev";
        public static string ValidIssuer = "https://ghobrial.dev";

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
        Guest
    }
}
