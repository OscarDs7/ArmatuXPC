using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ArmatuXPC.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Componentes",
                columns: table => new
                {
                    ComponenteId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Marca = table.Column<string>(type: "text", nullable: false),
                    Modelo = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Voltaje = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Componentes", x => x.ComponenteId);
                });

            migrationBuilder.CreateTable(
                name: "Armados",
                columns: table => new
                {
                    ArmadoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    NombreArmado = table.Column<string>(type: "text", nullable: false),
                    GabineteId = table.Column<int>(type: "integer", nullable: true),
                    PlacaBaseId = table.Column<int>(type: "integer", nullable: true),
                    FuentePoderId = table.Column<int>(type: "integer", nullable: true),
                    MemoriaRamId = table.Column<int>(type: "integer", nullable: true),
                    ProcesadorId = table.Column<int>(type: "integer", nullable: true),
                    AlmacenamientoId = table.Column<int>(type: "integer", nullable: true),
                    GPUId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Armados", x => x.ArmadoId);
                    table.ForeignKey(
                        name: "FK_Armados_Componentes_AlmacenamientoId",
                        column: x => x.AlmacenamientoId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Armados_Componentes_FuentePoderId",
                        column: x => x.FuentePoderId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Armados_Componentes_GPUId",
                        column: x => x.GPUId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Armados_Componentes_GabineteId",
                        column: x => x.GabineteId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Armados_Componentes_MemoriaRamId",
                        column: x => x.MemoriaRamId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Armados_Componentes_PlacaBaseId",
                        column: x => x.PlacaBaseId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Armados_Componentes_ProcesadorId",
                        column: x => x.ProcesadorId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Compatibilidades",
                columns: table => new
                {
                    CompatibilidadId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ComponenteAId = table.Column<int>(type: "integer", nullable: false),
                    ComponenteBId = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "text", nullable: false),
                    EsCompatible = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Compatibilidades", x => x.CompatibilidadId);
                    table.ForeignKey(
                        name: "FK_Compatibilidades_Componentes_ComponenteAId",
                        column: x => x.ComponenteAId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Compatibilidades_Componentes_ComponenteBId",
                        column: x => x.ComponenteBId,
                        principalTable: "Componentes",
                        principalColumn: "ComponenteId",
                        onDelete: ReferentialAction.Restrict);
                });

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

            migrationBuilder.CreateIndex(
                name: "IX_Compatibilidades_ComponenteAId",
                table: "Compatibilidades",
                column: "ComponenteAId");

            migrationBuilder.CreateIndex(
                name: "IX_Compatibilidades_ComponenteBId",
                table: "Compatibilidades",
                column: "ComponenteBId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Armados");

            migrationBuilder.DropTable(
                name: "Compatibilidades");

            migrationBuilder.DropTable(
                name: "Componentes");
        }
    }
}
