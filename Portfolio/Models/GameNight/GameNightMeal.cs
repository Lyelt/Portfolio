using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.GameNight
{
    public class GameNightMeal
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }

        public DateTime DateAdded { get; set; }
    }
}
