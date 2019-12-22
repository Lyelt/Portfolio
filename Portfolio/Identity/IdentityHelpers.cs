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
    }

    public enum ApplicationRole
    {
        Administrator,
        Speedrunner,
        Bowler,
        Duelist
    }
}
