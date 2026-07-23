using System;

namespace Portfolio.Extensions
{
    public static class SpeedrunExtensions
    {
        public static int GetFrames(this TimeSpan timeSpan) => (int)Math.Ceiling(timeSpan.TotalSeconds * 29.97);
    }
}
