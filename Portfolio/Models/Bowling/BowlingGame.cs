using System.Text.Json.Serialization;
using Portfolio.Models.Auth;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Portfolio.Models.Bowling
{
    public class BowlingGame
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        [JsonIgnore]
        public ApplicationUser User { get; set; }

        [Required]
        public int BowlingSessionId { get; set; }
        [JsonIgnore]
        public BowlingSession Session { get; set; }

        [Required]
        public int TotalScore { get; set; }

        [Required]
        public int GameNumber { get; set; }

        public List<BowlingFrame> Frames { get; set; }

    }
}
