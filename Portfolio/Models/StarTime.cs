using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Models
{
    public class StarTime
    {
        public Star Star { get; set; }
        public int StarId { get; set; }

        public ApplicationUser User { get; set; }
        public string UserId { get; set; }

        public DateTime LastUpdated { get; set; }
        public TimeSpan Time { get; set; }
        public string VideoUrl { get; set; }

        [NotMapped]
        public string TimeDisplay { get; set; }

        public StarTime WithClientView()
        {
            TimeDisplay = Time.ToString("mm\\:ss\\.ff");
            return this;
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
