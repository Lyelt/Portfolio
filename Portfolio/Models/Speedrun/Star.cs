using System.ComponentModel.DataAnnotations;

namespace Portfolio.Models.Speedrun
{
    public class Star
    {
        [Key]
        public int StarId { get; set; }
        [Required]
        public string Name { get; set; }

        public int CourseId { get; set; }
        
        public int DisplayOrder { get; set; }

        public string RtaGuideUrl { get; set; }

        public string SingleStarUrl { get; set; }
    }
}
