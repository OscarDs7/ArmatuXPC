using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class ChangeWattsToInt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ConsumoWatts",
                table: "Componentes",
                type: "integer",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CapacidadWatts",
                table: "Componentes",
                type: "integer",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "numeric(10,2)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "ConsumoWatts",
                table: "Componentes",
                type: "numeric(10,2)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "CapacidadWatts",
                table: "Componentes",
                type: "numeric(10,2)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);
        }
    }
}
