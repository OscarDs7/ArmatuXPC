using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarCamposTecnicos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Chipset",
                table: "Componentes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FactorForma",
                table: "Componentes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Socket",
                table: "Componentes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TipoMemoria",
                table: "Componentes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Chipset",
                table: "Componentes");

            migrationBuilder.DropColumn(
                name: "FactorForma",
                table: "Componentes");

            migrationBuilder.DropColumn(
                name: "Socket",
                table: "Componentes");

            migrationBuilder.DropColumn(
                name: "TipoMemoria",
                table: "Componentes");
        }
    }
}
