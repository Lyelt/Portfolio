using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.GameNight
{
    public class GameNight
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [ForeignKey("User")]
        public string? UserId { get; set; }

        public virtual ApplicationUser User { get; set; }

        [ForeignKey("GameNightPreset")]
        public int? GameNightPresetId { get; set; }

        public virtual GameNightPreset GameNightPreset { get; set; }
    }
}
