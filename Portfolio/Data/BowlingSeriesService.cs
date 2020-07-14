using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Portfolio.Models.Auth;
using Portfolio.Models.Bowling;

namespace Portfolio.Data
{
    public class BowlingSeriesService
    {
        private List<BowlingSession> _sessions;
        private List<ApplicationUser> _bowlers;

        public BowlingSeriesService(List<BowlingSession> sessions, List<ApplicationUser> bowlers)
        {
            _sessions = sessions;
            _bowlers = bowlers;
        }

        public List<BowlingSeries> GetSeries(SeriesCategory seriesCategory)
        {
            switch (seriesCategory)
            {
                case SeriesCategory.SessionAverage:
                    return GetSessionAverageSeries();
                case SeriesCategory.OverallAverage:
                    return GetOverallAverageSeries();
                case SeriesCategory.Game:
                    return GetGameSeries();
                case SeriesCategory.StrikePct:
                    return GetStrikePercentSeries();
                case SeriesCategory.SinglePinSparePct:
                    return GetSinglePinSparePercentSeries();
                default:
                    return new List<BowlingSeries>();
            }
        }

        private List<BowlingSeries> GetSessionAverageSeries()
        {
            List<BowlingSeries> series = new List<BowlingSeries>();
            foreach (var bowler in _bowlers)
            {
                List<SeriesEntry> bowlerSeries = new List<SeriesEntry>();
                foreach (var session in _sessions.OrderBy(s => s.Date))
                {
                    var games = session.Games.Where(g => g.UserId == bowler.Id).ToList();
                    if (games.Count > 0)
                        bowlerSeries.Add(new SeriesEntry { Name = session.Date, Value = games.Average(g => g.TotalScore) });
                }

                if (bowlerSeries.Count > 0)
                    series.Add(new BowlingSeries { Name = bowler.UserName, Series = bowlerSeries });
            }
            return series;
        }

        private List<BowlingSeries> GetOverallAverageSeries()
        {
            List<BowlingSeries> series = new List<BowlingSeries>();
            foreach (var bowler in _bowlers)
            {
                List<SeriesEntry> bowlerSeries = new List<SeriesEntry>();
                double scoreSoFar = 0;
                int totalGames = 0;

                foreach (var session in _sessions.OrderBy(s => s.Date))
                {
                    var games = session.Games.Where(g => g.UserId == bowler.Id);

                    foreach (var game in games)
                    {
                        scoreSoFar += game.TotalScore;
                        totalGames++;
                    }

                    if (totalGames > 0)
                        bowlerSeries.Add(new SeriesEntry { Name = session.Date, Value = Math.Round(scoreSoFar / totalGames, 2) });
                }

                if (bowlerSeries.Count > 0)
                    series.Add(new BowlingSeries { Name = bowler.UserName, Series = bowlerSeries });
            }
            return series;
        }

        private List<BowlingSeries> GetGameSeries()
        {
            List<BowlingSeries> series = new List<BowlingSeries>();
            foreach (var bowler in _bowlers)
            {
                List<SeriesEntry> bowlerSeries = new List<SeriesEntry>();
                var games = _sessions.OrderBy(s => s.Date).SelectMany(s => s.Games.Where(g => g.UserId == bowler.Id));

                foreach (var game in games)
                {
                    // For the purpose of charting, make each game appear one after another time-wise.
                    game.Session.Date = game.Session.Date.AddHours(game.GameNumber);
                    bowlerSeries.Add(new SeriesEntry { Name = game.Session.Date, Value = game.TotalScore });
                }

                if (bowlerSeries.Count > 0)
                    series.Add(new BowlingSeries { Name = bowler.UserName, Series = bowlerSeries });
            }
            return series;
        }

        private List<BowlingSeries> GetSinglePinSparePercentSeries()
        {
            List<BowlingSeries> series = new List<BowlingSeries>();
            foreach (var bowler in _bowlers)
            {
                List<SeriesEntry> bowlerSeries = new List<SeriesEntry>();
                double singlePinSparePercentSoFar = 0;
                int sessionCount = 0;

                foreach (var session in _sessions.OrderBy(s => s.Date))
                {
                    var games = session.Games.Where(g => g.UserId == bowler.Id).ToList();

                    if (games.Count > 0)
                    {
                        singlePinSparePercentSoFar += new BowlingStatCalculator(games).SinglePinSpares().Value;
                        sessionCount++;
                        bowlerSeries.Add(new SeriesEntry { Name = session.Date, Value = Math.Round(singlePinSparePercentSoFar / sessionCount, 2) });
                    }
                }

                if (bowlerSeries.Count > 0)
                    series.Add(new BowlingSeries { Name = bowler.UserName, Series = bowlerSeries });
            }
            return series;
        }

        private List<BowlingSeries> GetStrikePercentSeries()
        {
            List<BowlingSeries> series = new List<BowlingSeries>();
            foreach (var bowler in _bowlers)
            {
                List<SeriesEntry> bowlerSeries = new List<SeriesEntry>();
                double strikePercentSoFar = 0;
                int sessionCount = 0;

                foreach (var session in _sessions.OrderBy(s => s.Date))
                {
                    var games = session.Games.Where(g => g.UserId == bowler.Id).ToList();

                    if (games.Count > 0)
                    {
                        strikePercentSoFar += new BowlingStatCalculator(games).StrikePercentage().Value;
                        sessionCount++;
                        bowlerSeries.Add(new SeriesEntry { Name = session.Date, Value = Math.Round(strikePercentSoFar / sessionCount, 2) });
                    }
                }

                if (bowlerSeries.Count > 0)
                    series.Add(new BowlingSeries { Name = bowler.UserName, Series = bowlerSeries });
            }
            return series;
        }
    }
}
