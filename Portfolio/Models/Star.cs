using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models
{
    public class Star
    {
        [Key]
        public int StarId { get; set; }
        [Required]
        public string Name { get; set; }

        public int CourseId { get; set; }
    }
}
