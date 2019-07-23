﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models
{
    public class BowlingGame
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string UserId { get; set; }
        public ApplicationUser User { get; set; }

        [Required]
        public int SessionId { get; set; }
        public BowlingSession Session { get; set; }

        [Required]
        public int TotalScore { get; set; }

        [Required]
        public int GameNumber { get; set; }

        public List<BowlingFrame> Frames { get; set; }

    }
}
