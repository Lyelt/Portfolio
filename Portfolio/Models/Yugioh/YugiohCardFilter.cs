using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Yugioh
{
    public class YugiohCardFilter
    {
        public List<PropertyFilter> Filters { get; set; }

        public int PageNumber { get; set; }

        public int Count { get; set; }

        // Sort Type

    }

    public class PropertyFilter
    {
        public string Name { get; set; }

        public string Value { get; set; }

        public double? HighValue { get; set; }

        public double? LowValue { get; set; }
    }
}
