using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddArmadoComponenteRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IdComponente",
                table: "Compatibilidades",
                newName: "ComponenteId");

            migrationBuilder.CreateIndex(
                name: "IX_Compatibilidades_ComponenteId",
                table: "Compatibilidades",
                column: "ComponenteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteId",
                table: "Compatibilidades",
                column: "ComponenteId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Compatibilidades_Componentes_ComponenteId",
                table: "Compatibilidades");

            migrationBuilder.DropIndex(
                name: "IX_Compatibilidades_ComponenteId",
                table: "Compatibilidades");

            migrationBuilder.RenameColumn(
                name: "ComponenteId",
                table: "Compatibilidades",
                newName: "IdComponente");
        }
    }
}
