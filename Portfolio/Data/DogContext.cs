using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Models.Speedrun;
using Portfolio.Models.Auth;
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
        }
    }
}
