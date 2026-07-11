using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Models.Auth;
using System;

namespace Portfolio.Data
{
    internal static class PostgresTimestampMappings
    {
        internal const string TimestampWithoutTimeZone = "timestamp(6) without time zone";

        internal static readonly ValueConverter<DateTime, DateTime> WallClock = new(
            value => DateTime.SpecifyKind(value, DateTimeKind.Unspecified),
            value => DateTime.SpecifyKind(value, DateTimeKind.Unspecified));

        internal static readonly ValueConverter<DateTime, DateTime> UtcStoredNaive = new(
            value => DateTime.SpecifyKind(value, DateTimeKind.Unspecified),
            value => DateTime.SpecifyKind(value, DateTimeKind.Utc));

        private static readonly ValueConverter<DateTimeOffset?, DateTime?> UtcOffsetStoredNaive = new(
            value => value.HasValue
                ? DateTime.SpecifyKind(value.Value.UtcDateTime, DateTimeKind.Unspecified)
                : null,
            value => value.HasValue
                ? new DateTimeOffset(DateTime.SpecifyKind(value.Value, DateTimeKind.Utc))
                : null);

        internal static void ConfigureApplicationUserLockout(ModelBuilder builder, bool usePostgresColumnType = true)
        {
            var property = builder.Entity<ApplicationUser>()
                .Property(user => user.LockoutEnd)
                .HasConversion(UtcOffsetStoredNaive);

            if (usePostgresColumnType)
                property.HasColumnType(TimestampWithoutTimeZone);
        }
    }
}
