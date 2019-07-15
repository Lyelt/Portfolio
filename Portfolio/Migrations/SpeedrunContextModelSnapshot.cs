﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Data;

namespace Portfolio.Migrations
{
    [DbContext(typeof(SpeedrunContext))]
    partial class SpeedrunContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.11-servicing-32099")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Portfolio.Models.ApplicationUser", b =>
                {
                    b.Property<string>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("AccessFailedCount");

                    b.Property<string>("ConcurrencyStamp");

                    b.Property<string>("Email");

                    b.Property<bool>("EmailConfirmed");

                    b.Property<bool>("LockoutEnabled");

                    b.Property<DateTimeOffset?>("LockoutEnd");

                    b.Property<string>("NormalizedEmail");

                    b.Property<string>("NormalizedUserName");

                    b.Property<string>("PasswordHash");

                    b.Property<string>("PhoneNumber");

                    b.Property<bool>("PhoneNumberConfirmed");

                    b.Property<string>("SecurityStamp");

                    b.Property<bool>("TwoFactorEnabled");

                    b.Property<string>("UserName");

                    b.HasKey("Id");

                    b.ToTable("AspNetUsers");
                });

            modelBuilder.Entity("Portfolio.Models.Course", b =>
                {
                    b.Property<int>("CourseId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Abbreviation")
                        .HasMaxLength(5);

                    b.Property<string>("Name")
                        .IsRequired();

                    b.HasKey("CourseId");

                    b.ToTable("Courses");
                });

            modelBuilder.Entity("Portfolio.Models.Star", b =>
                {
                    b.Property<int>("StarId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("CourseId");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.HasKey("StarId");

                    b.HasIndex("CourseId");

                    b.ToTable("Stars");
                });

            modelBuilder.Entity("Portfolio.Models.StarTime", b =>
                {
                    b.Property<int>("StarId");

                    b.Property<string>("UserId");

                    b.Property<DateTime>("LastUpdated");

                    b.Property<long>("Time");

                    b.Property<string>("VideoUrl");

                    b.HasKey("StarId", "UserId");

                    b.HasIndex("UserId");

                    b.ToTable("StarTimes");
                });

            modelBuilder.Entity("Portfolio.Models.Star", b =>
                {
                    b.HasOne("Portfolio.Models.Course")
                        .WithMany("Stars")
                        .HasForeignKey("CourseId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Portfolio.Models.StarTime", b =>
                {
                    b.HasOne("Portfolio.Models.Star", "Star")
                        .WithMany()
                        .HasForeignKey("StarId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("Portfolio.Models.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
