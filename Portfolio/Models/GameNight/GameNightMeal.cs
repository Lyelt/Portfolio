using System;
using System.ComponentModel.DataAnnotations;

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
