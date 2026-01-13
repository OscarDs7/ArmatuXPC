using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddCompatibilidades : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteId",
                table: "Compatibilidades");

            migrationBuilder.DropColumn(
                name: "MarcaComponente",
                table: "Compatibilidades");

            migrationBuilder.DropColumn(
                name: "MarcaIncompatible",
                table: "Compatibilidades");

            migrationBuilder.RenameColumn(
                name: "RazonIncompatibilidad",
                table: "Compatibilidades",
                newName: "Motivo");

            migrationBuilder.RenameColumn(
                name: "ComponenteId",
                table: "Compatibilidades",
                newName: "ComponenteBId");

            migrationBuilder.RenameIndex(
                name: "IX_Compatibilidades_ComponenteId",
                table: "Compatibilidades",
                newName: "IX_Compatibilidades_ComponenteBId");

            migrationBuilder.AddColumn<int>(
                name: "ComponenteAId",
                table: "Compatibilidades",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "EsCompatible",
                table: "Compatibilidades",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_Compatibilidades_ComponenteAId",
                table: "Compatibilidades",
                column: "ComponenteAId");

            migrationBuilder.AddForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteAId",
                table: "Compatibilidades",
                column: "ComponenteAId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteBId",
                table: "Compatibilidades",
                column: "ComponenteBId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteAId",
                table: "Compatibilidades");

            migrationBuilder.DropForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteBId",
                table: "Compatibilidades");

            migrationBuilder.DropIndex(
                name: "IX_Compatibilidades_ComponenteAId",
                table: "Compatibilidades");

            migrationBuilder.DropColumn(
                name: "ComponenteAId",
                table: "Compatibilidades");

            migrationBuilder.DropColumn(
                name: "EsCompatible",
                table: "Compatibilidades");

            migrationBuilder.RenameColumn(
                name: "Motivo",
                table: "Compatibilidades",
                newName: "RazonIncompatibilidad");

            migrationBuilder.RenameColumn(
                name: "ComponenteBId",
                table: "Compatibilidades",
                newName: "ComponenteId");

            migrationBuilder.RenameIndex(
                name: "IX_Compatibilidades_ComponenteBId",
                table: "Compatibilidades",
                newName: "IX_Compatibilidades_ComponenteId");

            migrationBuilder.AddColumn<string>(
                name: "MarcaComponente",
                table: "Compatibilidades",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "MarcaIncompatible",
                table: "Compatibilidades",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteId",
                table: "Compatibilidades",
                column: "ComponenteId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
