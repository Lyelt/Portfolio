using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Models.GameNight;
using Portfolio.Models.Auth;

namespace Portfolio.Data
{
    public class GameNightContext : DbContext
    {
        public DbSet<GameNight> GameNights { get; set; }

        public DbSet<GameNightMeal> GameNightMeals { get; set; }

        public DbSet<GameNightGame> Games { get; set; }

        public GameNightContext(DbContextOptions<GameNightContext> options)
               : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>()
                .ToTable("AspNetUsers");

            builder.Entity<GameNight>()
                .HasOne(gn => gn.User)
                .WithMany();

            builder.Entity<GameNight>()
                .HasMany(gn => gn.Games)
                .WithMany();

            builder.Entity<GameNight>()
                .HasOne(gn => gn.Meal)
                .WithMany();

            //builder.Entity<GameNight>()
            //    .HasMany(gn => gn.UserStatuses)
            //    .WithMany();



            builder.Entity<GameNight>()
                .Property(gn => gn.GameNightMealId)
                .IsRequired(false);

            builder.Entity<GameNight>()
                .Property(gn => gn.UserId)
                .IsRequired(false);

            builder.Entity<GameNightGame>()
                .Property(g => g.Image)
                .HasDefaultValue(null);
        }
    }
}
