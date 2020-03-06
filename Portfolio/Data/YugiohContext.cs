using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Models.Speedrun;
using Portfolio.Models.Auth;
using Portfolio.Models.Yugioh;

namespace Portfolio.Data
{
    public class YugiohContext : DbContext
    {
        public DbSet<CardCollection> Collections { get; set; }

        public YugiohContext(DbContextOptions<YugiohContext> options)
               : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<ApplicationUser>()
                .ToTable("AspNetUsers");

            builder.Entity<CardCollection>()
                .ToTable("CardCollections");

            // Cards in a collection
            builder.Entity<Card>()
                .ToTable("CardIds");

            builder.Entity<Card>()
                .HasOne(c => c.CardCollection)
                .WithMany(c => c.CardIds)
                .HasForeignKey(c => c.CardCollectionId);

            builder.Entity<Card>()
                .HasKey(c => new { c.Id, c.Section });

            builder.Entity<Card>()
                .Property(c => c.Id)
                .ValueGeneratedNever();

            // Card collections
            builder.Entity<CardCollection>()
                .HasMany(cc => cc.CardIds)
                .WithOne(cc => cc.CardCollection);

            builder.Entity<CardCollection>()
                .HasOne(c => c.User)
                .WithMany();

            builder.Entity<CardCollection>()
                .HasIndex(cc => new { cc.UserId, cc.Name })
                .IsUnique();
        }
    }
}
