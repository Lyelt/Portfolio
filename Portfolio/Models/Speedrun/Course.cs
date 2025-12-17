using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Portfolio.Models.Speedrun
{
    public class Course
    {
        [Key]
        public int CourseId { get; set; }
        [Required]
        public string Name { get; set; }
        [MaxLength(5)]
        public string? Abbreviation { get; set; }

        public List<Star> Stars { get; set; }
    }
}
