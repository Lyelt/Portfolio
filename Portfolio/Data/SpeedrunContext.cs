﻿using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Models.Speedrun;
using Portfolio.Models.Auth;

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
                .HasKey(st => new { st.StarId, st.UserId });

            builder.Entity<StarTime>()
                .HasOne(st => st.Star)
                .WithMany();

            builder.Entity<StarTime>()
               .HasOne(st => st.User)
               .WithMany();

            builder.Entity<StarTime>()
                .Property(st => st.Time)
                .HasConversion(new TimeSpanToTicksConverter());
        }
    }
}
