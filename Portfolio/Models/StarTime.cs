using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models
{
    public class StarTime
    {
        [Key]
        public int StarId { get; set; }

        public string Name { get; set; }

        public string Level { get; set; }

        public string Time { get; set; }
    }
}
