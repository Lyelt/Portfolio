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
            stats.Add(TotalGamesBowled());
            stats.Add(OverallAverage());
            stats.Add(HighestScore());
            stats.Add(SinglePinSpares());
            return stats;
        }

        public BowlingStat TotalGamesBowled() => new BowlingStat("Total Games Bowled", _games.Count);

        public BowlingStat OverallAverage() => new BowlingStat("Overall Average", Math.Round(_games.Select(g => g.TotalScore).DefaultIfEmpty(0).Average(), 2));

        public BowlingStat HighestScore() => new BowlingStat("Highest Score", _games.Select(g => g.TotalScore).DefaultIfEmpty(0).Max());

        public BowlingStat SinglePinSpares()
        {
            var allFrames = _games.SelectMany(g => g.Frames);

            var singlePinSpares = allFrames.Where(frame => IsSinglePinSpare(frame)).ToList();
            var numConvertedSinglePins = singlePinSpares.Where(frame => frame.Roll2Score == 1).ToList().Count;
            double ratio = singlePinSpares.Count > 0 ? ((double)numConvertedSinglePins / singlePinSpares.Count) : 0;

            return new BowlingStat("Single Pin Spare Conversions", Math.Round(ratio * 100, 2), "%", $"{numConvertedSinglePins}/{singlePinSpares.Count}");
        }

        //public BowlingStat MostConsecutiveStrikes()
        //{
        //    var maxConsecutiveStrikes = 0;

        //    foreach (var game in _games)
        //    {
        //        if ()
        //    }
        //}

        //private int MostConsecutiveStrikes(BowlingGame game)
        //{
        //    game.Frames.
        //}

        private bool IsSinglePinSpare(BowlingFrame frame)
        {
            // Normal case, 9/ or 9-
            return frame.Roll1Score == 9 
                // If we're in the 10th frame, then the score could also be X9/ or X9-
                || (frame.FrameNumber == 10 && frame.Roll1Score == 10 && frame.Roll2Score == 9);
        }
    }
}
