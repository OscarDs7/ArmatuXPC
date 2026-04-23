using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCompletoSinAyuda : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "CompletoSinAyuda",
                table: "Feedbacks",
                type: "boolean",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletoSinAyuda",
                table: "Feedbacks");
        }
    }
}