using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models
{
    public class BowlingSession
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public DateTime Date { get; set; }

        public List<BowlingGame> Games { get; set; }

        public override bool Equals(object obj)
        {
            return obj is BowlingSession bs && bs.Id == Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }
}
