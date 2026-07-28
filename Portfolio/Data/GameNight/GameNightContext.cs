using Microsoft.EntityFrameworkCore;
using Portfolio.Models.GameNight;
using Portfolio.Models.Auth;

namespace Portfolio.Data
{
    public class GameNightContext : DbContext
    {
        public DbSet<GameNight> GameNights { get; set; }

        public DbSet<GameNightMeal> GameNightMeals { get; set; }

        public DbSet<GameNightGame> Games { get; set; }

        public DbSet<GameNightUserStatus> GameNightUserStatuses { get; set; }

        public GameNightContext(DbContextOptions<GameNightContext> options)
               : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>()
                .ToTable("AspNetUsers");

            PostgresTimestampMappings.ConfigureApplicationUserLockout(builder);

            builder.Entity<GameNight>()
                .HasOne(gn => gn.User)
                .WithMany();

            builder.Entity<GameNight>()
                .HasMany(gn => gn.Games)
                .WithMany();

            builder.Entity<GameNight>()
                .HasOne(gn => gn.Meal)
                .WithMany();

            builder.Entity<GameNight>()
                .HasMany(gn => gn.UserStatuses)
                .WithOne(us => us.GameNight)
                .HasForeignKey(us => us.GameNightId);

            builder.Entity<GameNightUserStatus>()
                .HasOne(u => u.User)
                .WithMany()
                .HasForeignKey(u => u.UserId);

            builder.Entity<GameNight>()
                .Property(gn => gn.GameNightMealId)
                .IsRequired(false);

            builder.Entity<GameNight>()
                .Property(gn => gn.UserId)
                .IsRequired(false);

            builder.Entity<GameNight>()
                .Property(gameNight => gameNight.Date)
                .HasConversion(PostgresTimestampMappings.WallClock)
                .HasColumnType(PostgresTimestampMappings.TimestampWithoutTimeZone);

            builder.Entity<GameNightMeal>()
                .Property(meal => meal.DateAdded)
                .HasConversion(PostgresTimestampMappings.WallClock)
                .HasColumnType(PostgresTimestampMappings.TimestampWithoutTimeZone);

            builder.Entity<GameNightGame>()
                .Property(g => g.Image)
                .HasDefaultValue(null);
        }
    }
}
