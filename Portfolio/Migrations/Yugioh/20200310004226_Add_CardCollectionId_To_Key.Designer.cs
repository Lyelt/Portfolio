﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Portfolio.Data;

namespace Portfolio.Migrations.Yugioh
{
    [DbContext(typeof(YugiohContext))]
    [Migration("20200310004226_Add_CardCollectionId_To_Key")]
    partial class Add_CardCollectionId_To_Key
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.1.11-servicing-32099")
                .HasAnnotation("Relational:MaxIdentifierLength", 64);

            modelBuilder.Entity("Portfolio.Models.Auth.ApplicationUser", b =>
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

            modelBuilder.Entity("Portfolio.Models.Yugioh.Card", b =>
                {
                    b.Property<int>("Id");

                    b.Property<string>("Section");

                    b.Property<int>("CardCollectionId");

                    b.Property<int>("Quantity");

                    b.Property<string>("SetCode");

                    b.HasKey("Id", "Section", "CardCollectionId");

                    b.HasIndex("CardCollectionId");

                    b.ToTable("CardIds");
                });

            modelBuilder.Entity("Portfolio.Models.Yugioh.CardCollection", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<string>("UserId")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("UserId", "Name")
                        .IsUnique();

                    b.ToTable("CardCollections");
                });

            modelBuilder.Entity("Portfolio.Models.Yugioh.Card", b =>
                {
                    b.HasOne("Portfolio.Models.Yugioh.CardCollection", "CardCollection")
                        .WithMany("CardIds")
                        .HasForeignKey("CardCollectionId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("Portfolio.Models.Yugioh.CardCollection", b =>
                {
                    b.HasOne("Portfolio.Models.Auth.ApplicationUser", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
