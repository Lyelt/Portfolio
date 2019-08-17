using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Bowling
{
    public class BowlingSeries
    {
        public string Name { get; set; }

        public List<SeriesEntry> Series { get; set; }
    }

    public class SeriesEntry
    {
        public DateTime Name { get; set; }

        public double Value { get; set; }
    }

    public enum SeriesCategory
    {
        SessionAverage,
        OverallAverage,
        Game,
        StrikePct,
        SinglePinSparePct
    }
}
