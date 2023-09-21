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

        public DbSet<GameNightPreset> GameNightPresets { get; set; }

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
                .HasOne(gn => gn.GameNightPreset)
                .WithMany();

            builder.Entity<GameNightPreset>()
                .HasMany(gn => gn.Games)
                .WithMany();

            builder.Entity<GameNightPreset>()
                .HasOne(gnp => gnp.User)
                .WithMany();

        }
    }
}
