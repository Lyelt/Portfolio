using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Bowling
{
    public class BowlingStat
    {
        public string Name { get; set; }

        public double Value { get; set; }

        public string Unit { get; set; }

        public string Details { get; set; }

        public BowlingStat(string name, double value, string unit = "", string details = "")
        {
            Name = name;
            Value = value;
            Unit = unit;
            Details = details;
        }
    }
}
