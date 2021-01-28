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
            var validRoles = context.Roles.Where(r => validRoleNames.Contains(r.Name));
            var validUserRoles = context.UserRoles.Join(validRoles, ur => ur.RoleId, r => r.Id, (userRole, role) => userRole);
            var validUsers = context.Users.Join(validUserRoles, u => u.Id, ur => ur.UserId, (user, userRole) => user).Distinct().ToList();
            return validUsers;
        }
    }

    public enum ApplicationRole
    {
        Administrator,
        Speedrunner,
        Bowler,
        Duelist,
        Guest
    }
}
