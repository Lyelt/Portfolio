using System;

namespace Portfolio.Extensions
{
    public static class StringExtensions
    {
        public static bool ContainsIgnoreCase(this string str, string other) => str.Contains(other, StringComparison.OrdinalIgnoreCase);
    }
}
