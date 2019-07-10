using Portfolio.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Portfolio.Data
{
    public class SpeedrunContext : DbContext
    {
        public DbSet<StarTime> StarTimes { get; set; }

        public DbSet<Star> Stars { get; set; }

        public DbSet<Course> Courses { get; set; }

        public SpeedrunContext(DbContextOptions<SpeedrunContext> options)
               : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>()
                .ToTable("AspNetUsers");

            builder.Entity<Course>()
                .HasMany(c => c.Stars)
                .WithOne();

            builder.Entity<StarTime>()
                .HasOne(st => st.Star)
                .WithOne();

            builder.Entity<StarTime>()
                .HasOne(st => st.User)
                .WithOne();

            builder.Entity<StarTime>()
                .HasIndex(i => new { i.UserId, i.StarId })
                .IsUnique();
        }
    }
}
