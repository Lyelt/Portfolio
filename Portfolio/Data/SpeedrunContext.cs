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

            builder.Entity<Star>()
                .Property<int>("CourseForeignKey");

            builder.Entity<Star>()
                .HasOne(s => s.Course)
                .WithMany(c => c.Stars)
                .HasForeignKey("CourseForeignKey");

            builder.Entity<StarTime>()
                .HasOne(st => st.Star)
                .WithOne()
                .HasForeignKey<Star>(s => s.StarId);

            builder.Entity<StarTime>()
                .HasOne(st => st.User)
                .WithOne();
        }
    }
}
