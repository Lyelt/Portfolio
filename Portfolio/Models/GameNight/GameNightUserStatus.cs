using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.GameNight
{
    public class GameNightUserStatus
    {
        public ApplicationUser User { get; set; }

        public UserStatus Status { get; set; }
    }

    public enum UserStatus
    {
        Available,
        Partial,
        NotAvailable,
        Unknown
    }
}
