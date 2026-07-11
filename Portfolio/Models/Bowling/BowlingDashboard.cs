using System.Collections.Generic;

namespace Portfolio.Models.Bowling
{
    public sealed class BowlingDashboardRequest
    {
        public string UserId { get; set; }

        public bool LeagueMatchesOnly { get; set; } = true;

        public long? StartTime { get; set; }

        public long? EndTime { get; set; }

        public SeriesCategory SeriesCategory { get; set; } = SeriesCategory.SessionAverage;

        public StatCategory StatCategory { get; set; } = StatCategory.Overall;
    }

    public sealed class BowlingDashboard
    {
        public List<BowlingSession> Sessions { get; set; }

        public List<BowlingSeries> Series { get; set; }

        public List<BowlingStat> Stats { get; set; }
    }
}
