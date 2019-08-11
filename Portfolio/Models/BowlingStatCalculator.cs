using MoreLinq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models
{
    public class BowlingStatCalculator
    {
        private readonly List<BowlingGame> _games;

        public BowlingStatCalculator(List<BowlingGame> games)
        {
            _games = games;
        }

        public List<BowlingStat> GetOverallStats()
        {
            var stats = new List<BowlingStat>();
            stats.Add(OverallAverage());
            stats.Add(HighestScore());
            stats.Add(TotalGamesBowled());
            stats.Add(StrikePercentage());
            stats.Add(SinglePinSpares());
            return stats;
        }

        public BowlingStat TotalGamesBowled() => new BowlingStat("Total Games Bowled", _games.Count);

        public BowlingStat OverallAverage() => new BowlingStat("Overall Average", AverageOfGames(_games));

        public BowlingStat HighestScore() => new BowlingStat("Highest Score", _games.Select(g => g.TotalScore).DefaultIfEmpty(0).Max());

        public BowlingStat LowestScore() => new BowlingStat("Lowest Score", _games.Select(g => g.TotalScore).DefaultIfEmpty(0).Min());

        public BowlingStat BestSessionAverage()
        {
            var gamesBySession = _games.GroupBy(g => g.Session).Select(g => new { Session = g.Key, Games = g.ToList() });
            var bestSession = gamesBySession.MaxBy(gs => AverageOfGames(gs.Games)).FirstOrDefault();
            return bestSession != null ? 
                new BowlingStat("Best Session Average", AverageOfGames(bestSession.Games), details: $"Session {bestSession.Session.Id} on {bestSession.Session.Date.ToShortDateString()}")
              : new BowlingStat("Best Session Average", 0);
        }
        public BowlingStat WorstSessionAverage()
        {
            var gamesBySession = _games.GroupBy(g => g.Session).Select(g => new { Session = g.Key, Games = g.ToList() });
            var worstSession = gamesBySession.MinBy(gs => AverageOfGames(gs.Games)).FirstOrDefault();
            return worstSession != null ? 
                new BowlingStat("Worst Session Average", AverageOfGames(worstSession.Games), details: $"Session {worstSession.Session.Id} on {worstSession.Session.Date.ToShortDateString()}")
              : new BowlingStat("Worst Session Average", 0);
        }

        public BowlingStat StrikePercentage()
        {
            var allFrames = _games.SelectMany(g => g.Frames).ToList();
            var strikes = allFrames.Where(f => f.IsStrike()).ToList();
            double ratio = allFrames.Count > 0 ? ((double)strikes.Count / allFrames.Count) : 0;
            return new BowlingStat("Strike Percentage", Math.Round(ratio * 100, 2), "%", $"{strikes.Count}/{allFrames.Count}");
        }

        public BowlingStat SinglePinSpares()
        {
            var allFrames = _games.SelectMany(g => g.Frames);

            var singlePinSpares = allFrames.Where(frame => frame.IsSinglePinSpare()).ToList();
            var numConvertedSinglePins = singlePinSpares.Where(frame => frame.IsConvertedSinglePinSpare()).ToList().Count;
            double ratio = singlePinSpares.Count > 0 ? ((double)numConvertedSinglePins / singlePinSpares.Count) : 0;

            return new BowlingStat("Single Pin Spare Conversions", Math.Round(ratio * 100, 2), "%", $"{numConvertedSinglePins}/{singlePinSpares.Count}");
        }

        public List<BowlingStat> GetCountStats()
        {
            var counts = new List<BowlingStat>();
            var allFrames = _games.SelectMany(g => g.Frames).ToList();
            var countGroups = allFrames.GroupBy(f => f.GetCount()).Select(g => new { CountValue = g.Key, Number = g.Count() });
            
            foreach (var group in countGroups.OrderByDescending(g => g.CountValue))
            {
                double ratio = allFrames.Count > 0 ? ((double)group.Number / allFrames.Count) : 0;
                counts.Add(new BowlingStat($"{group.CountValue} counts", Math.Round(ratio * 100, 2), "%", $"{group.Number}/{allFrames.Count}"));
            }

            return counts;
        }

        public List<BowlingStat> GetSplitStats()
        {
            var splits = new List<BowlingStat>();
            var allFrames = _games.SelectMany(g => g.Frames).ToList();
            var splitFrames = allFrames.Where(f => f.IsSplit).ToList();
            var convertedSplits = splitFrames.Where(f => f.IsConvertedSplit()).ToList();
            double ratio = splitFrames.Count > 0 ? ((double)convertedSplits.Count / splitFrames.Count) : 0;

            splits.Add(new BowlingStat("Total Splits", splitFrames.Count));
            splits.Add(new BowlingStat("Split Conversions", Math.Round(ratio * 100, 2), "%", $"{convertedSplits.Count}/{splitFrames.Count}"));

            return splits;
        }

        public List<BowlingStat> GetRecords()
        {
            var records = new List<BowlingStat>();
            records.Add(HighestScore());
            records.Add(LowestScore());
            records.Add(BestSessionAverage());
            records.Add(WorstSessionAverage());
            return records;
        }

        private double AverageOfGames(List<BowlingGame> games) => Math.Round(games.Select(g => g.TotalScore).DefaultIfEmpty(0).Average(), 2);
    }
}
