﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Data;

namespace Portfolio.Migrations.Bowling
{
    [DbContext(typeof(BowlingContext))]
    [Migration("20190724051017_InitialCreate")]
    partial class InitialCreate
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
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

            modelBuilder.Entity("Portfolio.Models.BowlingFrame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("BowlingGameId");

                    b.Property<int>("FrameNumber");

                    b.Property<bool>("IsSplit")
                        .ValueGeneratedOnAdd()
                        .HasDefaultValue(false);

                    b.Property<int>("Roll1Score");

                    b.Property<int>("Roll2Score")
                        .ValueGeneratedOnAdd()
                        .HasDefaultValue(0);

                    b.Property<int>("Roll3Score")
                        .ValueGeneratedOnAdd()
                        .HasDefaultValue(0);

                    b.HasKey("Id");

                    b.HasIndex("BowlingGameId", "FrameNumber")
                        .IsUnique();

                    b.ToTable("BowlingFrames");
                });

            modelBuilder.Entity("Portfolio.Models.BowlingGame", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("BowlingSessionId");

                    b.Property<int>("GameNumber");

                    b.Property<int>("TotalScore");

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.HasIndex("BowlingSessionId", "GameNumber", "UserId")
                        .IsUnique();

                    b.ToTable("BowlingGames");
                });

            modelBuilder.Entity("Portfolio.Models.BowlingSession", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime>("Date");

                    b.HasKey("Id");

                    b.ToTable("BowlingSessions");
                });

            modelBuilder.Entity("Portfolio.Models.BowlingFrame", b =>
                {
                    b.HasOne("Portfolio.Models.BowlingGame")
                        .WithMany("Frames")
                        .HasForeignKey("BowlingGameId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Portfolio.Models.BowlingGame", b =>
                {
                    b.HasOne("Portfolio.Models.BowlingSession", "Session")
                        .WithMany("Games")
                        .HasForeignKey("BowlingSessionId")
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
