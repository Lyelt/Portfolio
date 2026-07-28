using Microsoft.EntityFrameworkCore;
using Portfolio.Models.Dog;

namespace Portfolio.Data
{
    public class DogContext : DbContext
    {
        public DbSet<DogTime> DogTimes { get; set; }

        public DogContext(DbContextOptions<DogContext> options)
               : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder
                .Entity<DogTime>()
                .HasKey(dt => new { dt.Dog, dt.Timestamp });

            builder.Entity<DogTime>()
                .Property(dogTime => dogTime.Timestamp)
                .HasConversion(PostgresTimestampMappings.UtcStoredNaive)
                .HasColumnType(PostgresTimestampMappings.TimestampWithoutTimeZone);
        }
    }
}
