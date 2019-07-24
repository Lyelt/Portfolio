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

            builder.Entity<BowlingFrame>()
                .ToTable("BowlingFrames");

            builder.Entity<BowlingGame>()
                .ToTable("BowlingGames");

            builder.Entity<BowlingSession>()
                .ToTable("BowlingSessions");

            // Games

            builder.Entity<BowlingGame>()
                .HasMany(g => g.Frames)
                .WithOne()
                .HasForeignKey(f => f.BowlingGameId);

            builder.Entity<BowlingGame>()
                .HasIndex(g => new { g.BowlingSessionId, g.GameNumber, g.UserId })
                .IsUnique();

            builder.Entity<BowlingGame>()
                .HasOne(g => g.User)
                .WithMany();

            builder.Entity<BowlingGame>()
                .HasOne(g => g.Session)
                .WithMany();

            // Sessions

            builder.Entity<BowlingSession>()
                .HasMany(s => s.Games)
                .WithOne(g => g.Session);

            // Frames

            builder.Entity<BowlingFrame>()
                .HasIndex(f => new { f.BowlingGameId, f.FrameNumber })
                .IsUnique();

            builder.Entity<BowlingFrame>()
                .Property(f => f.Roll2Score)
                .HasDefaultValue(0);

            builder.Entity<BowlingFrame>()
                .Property(f => f.Roll3Score)
                .HasDefaultValue(0);

            builder.Entity<BowlingFrame>()
                .Property(f => f.IsSplit)
                .HasDefaultValue(false);
        }
    }
}
