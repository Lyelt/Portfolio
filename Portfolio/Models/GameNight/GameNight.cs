﻿using Portfolio.Models.Auth;
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

        [ForeignKey("GameNightMeal")]
        public int? GameNightMealId { get; set; }

        public virtual GameNightMeal Meal { get; set; }

        [ForeignKey("User")]
        public string? UserId { get; set; }

        public virtual ApplicationUser User { get; set; }

        public List<GameNightGame> Games { get; set; }

        public bool? IsCancelled { get; set; }

        public List<GameNightUserStatus> UserStatuses { get; set; }

        public GameNight GetCancelledCopy()
        {
            return new GameNight { Date = Date, IsCancelled = true };
        }
    }
}
