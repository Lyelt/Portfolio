using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Extensions
{
    public static class SpeedrunExtensions
    {
        public static int GetFrames(this TimeSpan timeSpan) => (int)Math.Ceiling(timeSpan.TotalSeconds * 29.97);
    }
}
