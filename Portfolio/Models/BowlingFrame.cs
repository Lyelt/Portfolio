using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models
{
    public class BowlingFrame
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BowlingGameId { get; set; }

        [Required]
        public int FrameNumber { get; set; }

        [Required]
        public int Roll1Score { get; set; }

        [Required]
        public int Roll2Score { get; set; }

        public int Roll3Score { get; set; }

        public bool IsSplit { get; set; }
    }
}
