using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Extensions
{
    public static class StringExtensions
    {
        public static bool EqualsIgnoreCase(this string str, string other) => str.Equals(other, StringComparison.OrdinalIgnoreCase);

        public static bool ContainsIgnoreCase(this string str, string other) => str.Contains(other, StringComparison.OrdinalIgnoreCase);
    }
}
