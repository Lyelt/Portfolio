using Microsoft.EntityFrameworkCore.Migrations;

namespace Portfolio.Migrations.Yugioh
{
    public partial class Add_CardCollectionId_To_Key : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CardIds",
                table: "CardIds");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CardIds",
                table: "CardIds",
                columns: new[] { "Id", "Section", "CardCollectionId" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_CardIds",
                table: "CardIds");

            migrationBuilder.AddPrimaryKey(
                name: "PK_CardIds",
                table: "CardIds",
                columns: new[] { "Id", "Section" });
        }
    }
}
