using System.ComponentModel.DataAnnotations;

namespace Portfolio.Models.GameNight
{
    public class GameNightGame
    {
        [Key]
        public int Id { get; set; }

        public string Name { get; set; }

        public string? Image { get; set; }

        public int MinPlayers { get; set; }

        public int MaxPlayers { get; set; }

    }
}
