using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPrecioToComponente : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "Precio",
                table: "Componentes",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Precio",
                table: "Componentes");
        }
    }
}
