using Portfolio.Models.Auth;
using System.ComponentModel.DataAnnotations;

namespace Portfolio.Models.GameNight
{
    public class GameNightUserStatus
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int GameNightId { get; set; }

        [Required]
        public GameNight GameNight { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]
        public ApplicationUser User { get; set; }

        [Required]
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
