using Portfolio.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public class BowlingContext : DbContext
    {
        public DbSet<BowlingSession> Sessions { get; set; }

        public DbSet<BowlingGame> Games { get; set; }

        public DbSet<BowlingFrame> Frames { get; set; }

        public BowlingContext(DbContextOptions<BowlingContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>()
                .ToTable("AspNetUsers");

            builder.Entity<BowlingGame>()
                .HasMany(g => g.Frames)
                .WithOne();

            builder.Entity<BowlingGame>()
                .HasOne(g => g.User)
                .WithMany();

            builder.Entity<BowlingGame>()
                .HasOne(g => g.Session)
                .WithMany();

            builder.Entity<BowlingSession>()
                .HasMany(s => s.Games)
                .WithOne();
        }
    }
}
