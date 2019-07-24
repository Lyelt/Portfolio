using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

namespace Portfolio.Migrations.Bowling
{
    public partial class InitialCreate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.CreateTable(
            //    name: "AspNetUsers",
            //    columns: table => new
            //    {
            //        Id = table.Column<string>(nullable: false),
            //        UserName = table.Column<string>(nullable: true),
            //        NormalizedUserName = table.Column<string>(nullable: true),
            //        Email = table.Column<string>(nullable: true),
            //        NormalizedEmail = table.Column<string>(nullable: true),
            //        EmailConfirmed = table.Column<bool>(nullable: false),
            //        PasswordHash = table.Column<string>(nullable: true),
            //        SecurityStamp = table.Column<string>(nullable: true),
            //        ConcurrencyStamp = table.Column<string>(nullable: true),
            //        PhoneNumber = table.Column<string>(nullable: true),
            //        PhoneNumberConfirmed = table.Column<bool>(nullable: false),
            //        TwoFactorEnabled = table.Column<bool>(nullable: false),
            //        LockoutEnd = table.Column<DateTimeOffset>(nullable: true),
            //        LockoutEnabled = table.Column<bool>(nullable: false),
            //        AccessFailedCount = table.Column<int>(nullable: false)
            //    },
            //    constraints: table =>
            //    {
            //        table.PrimaryKey("PK_AspNetUsers", x => x.Id);
            //    });

            migrationBuilder.CreateTable(
                name: "BowlingSessions",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    Date = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BowlingSessions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "BowlingGames",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<string>(nullable: false),
                    BowlingSessionId = table.Column<int>(nullable: false),
                    TotalScore = table.Column<int>(nullable: false),
                    GameNumber = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BowlingGames", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BowlingGames_BowlingSessions_BowlingSessionId",
                        column: x => x.BowlingSessionId,
                        principalTable: "BowlingSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_BowlingGames_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BowlingFrames",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    BowlingGameId = table.Column<int>(nullable: false),
                    FrameNumber = table.Column<int>(nullable: false),
                    Roll1Score = table.Column<int>(nullable: false),
                    Roll2Score = table.Column<int>(nullable: false, defaultValue: 0),
                    Roll3Score = table.Column<int>(nullable: false, defaultValue: 0),
                    IsSplit = table.Column<bool>(nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BowlingFrames", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BowlingFrames_BowlingGames_BowlingGameId",
                        column: x => x.BowlingGameId,
                        principalTable: "BowlingGames",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BowlingFrames_BowlingGameId_FrameNumber",
                table: "BowlingFrames",
                columns: new[] { "BowlingGameId", "FrameNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BowlingGames_UserId",
                table: "BowlingGames",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_BowlingGames_BowlingSessionId_GameNumber_UserId",
                table: "BowlingGames",
                columns: new[] { "BowlingSessionId", "GameNumber", "UserId" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BowlingFrames");

            migrationBuilder.DropTable(
                name: "BowlingGames");

            migrationBuilder.DropTable(
                name: "BowlingSessions");

            //migrationBuilder.DropTable(
            //    name: "AspNetUsers");
        }
    }
}
