using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddArmadoRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Armados_AlmacenamientoId",
                table: "Armados",
                column: "AlmacenamientoId");

            migrationBuilder.CreateIndex(
                name: "IX_Armados_FuentePoderId",
                table: "Armados",
                column: "FuentePoderId");

            migrationBuilder.CreateIndex(
                name: "IX_Armados_GabineteId",
                table: "Armados",
                column: "GabineteId");

            migrationBuilder.CreateIndex(
                name: "IX_Armados_GPUId",
                table: "Armados",
                column: "GPUId");

            migrationBuilder.CreateIndex(
                name: "IX_Armados_MemoriaRamId",
                table: "Armados",
                column: "MemoriaRamId");

            migrationBuilder.CreateIndex(
                name: "IX_Armados_PlacaBaseId",
                table: "Armados",
                column: "PlacaBaseId");

            migrationBuilder.CreateIndex(
                name: "IX_Armados_ProcesadorId",
                table: "Armados",
                column: "ProcesadorId");

            migrationBuilder.AddForeignKey(
                name: "FK_Armados_Componentes_AlmacenamientoId",
                table: "Armados",
                column: "AlmacenamientoId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Armados_Componentes_FuentePoderId",
                table: "Armados",
                column: "FuentePoderId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Armados_Componentes_GPUId",
                table: "Armados",
                column: "GPUId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Armados_Componentes_GabineteId",
                table: "Armados",
                column: "GabineteId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Armados_Componentes_MemoriaRamId",
                table: "Armados",
                column: "MemoriaRamId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Armados_Componentes_PlacaBaseId",
                table: "Armados",
                column: "PlacaBaseId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Armados_Componentes_ProcesadorId",
                table: "Armados",
                column: "ProcesadorId",
                principalTable: "Componentes",
                principalColumn: "ComponenteId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Armados_Componentes_AlmacenamientoId",
                table: "Armados");

            migrationBuilder.DropForeignKey(
                name: "FK_Armados_Componentes_FuentePoderId",
                table: "Armados");

            migrationBuilder.DropForeignKey(
                name: "FK_Armados_Componentes_GPUId",
                table: "Armados");

            migrationBuilder.DropForeignKey(
                name: "FK_Armados_Componentes_GabineteId",
                table: "Armados");

            migrationBuilder.DropForeignKey(
                name: "FK_Armados_Componentes_MemoriaRamId",
                table: "Armados");

            migrationBuilder.DropForeignKey(
                name: "FK_Armados_Componentes_PlacaBaseId",
                table: "Armados");

            migrationBuilder.DropForeignKey(
                name: "FK_Armados_Componentes_ProcesadorId",
                table: "Armados");

            migrationBuilder.DropIndex(
                name: "IX_Armados_AlmacenamientoId",
                table: "Armados");

            migrationBuilder.DropIndex(
                name: "IX_Armados_FuentePoderId",
                table: "Armados");

            migrationBuilder.DropIndex(
                name: "IX_Armados_GabineteId",
                table: "Armados");

            migrationBuilder.DropIndex(
                name: "IX_Armados_GPUId",
                table: "Armados");

            migrationBuilder.DropIndex(
                name: "IX_Armados_MemoriaRamId",
                table: "Armados");

            migrationBuilder.DropIndex(
                name: "IX_Armados_PlacaBaseId",
                table: "Armados");

            migrationBuilder.DropIndex(
                name: "IX_Armados_ProcesadorId",
                table: "Armados");
        }
    }
}
