using Portfolio.Extensions;
using Portfolio.Models.Auth;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models.Speedrun
{
    public class StarTime
    {
        public Star Star { get; set; }
        public int StarId { get; set; }

        public ApplicationUser User { get; set; }
        public string UserId { get; set; }

        public DateTime LastUpdated { get; set; }
        public TimeSpan Time { get; set; }
        public string? VideoUrl { get; set; }

        [NotMapped]
        public string TimeDisplay { get; set; }
        [NotMapped]
        public double TotalMilliseconds { get; set; }
        [NotMapped]
        public int? Frames { get; set; }

        public StarTime WithClientView()
        {
            TimeDisplay = Time.ToString("hh\\:mm\\:ss\\.ff");
            TotalMilliseconds = Time.TotalMilliseconds;
            Frames = Time.GetFrames();
            return this;
        }

        public ArchivedStarTime AsArchive()
        {
            return new ArchivedStarTime { Timestamp = LastUpdated, 
                Star = Star, StarId = StarId, 
                User = User, UserId = UserId, 
                LastUpdated = DateTime.UtcNow, 
                Time = Time, 
                VideoUrl = VideoUrl, 
                TimeDisplay = TimeDisplay, TotalMilliseconds = TotalMilliseconds, Frames = Frames 
            };
        }

        public override bool Equals(object obj)
        {
            return obj is StarTime st && st.StarId == StarId && st.UserId == UserId;
        }

        public override int GetHashCode()
        {
            return StarId.GetHashCode() + UserId.GetHashCode();
        }
    }
}
