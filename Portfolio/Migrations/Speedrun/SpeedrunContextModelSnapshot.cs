﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Data;

namespace Portfolio.Migrations.Speedrun
{
    [DbContext(typeof(SpeedrunContext))]
    partial class SpeedrunContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.11-servicing-32099");

            modelBuilder.Entity("Portfolio.Models.StarTime", b =>
                {
                    b.Property<int>("StarId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Level");

                    b.Property<string>("Name");

                    b.Property<string>("Time");

                    b.HasKey("StarId");

                    b.ToTable("StarTimes");
                });
#pragma warning restore 612, 618
        }
    }
}