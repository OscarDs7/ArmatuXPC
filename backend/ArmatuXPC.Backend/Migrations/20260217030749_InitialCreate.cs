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
                name: "Armados",
                columns: table => new
                {
                    ArmadoId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    NombreArmado = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Armados", x => x.ArmadoId);
                });

            migrationBuilder.CreateTable(
                name: "Componentes",
                columns: table => new
                {
                    ComponenteId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    Marca = table.Column<string>(type: "text", nullable: false),
                    Modelo = table.Column<string>(type: "text", nullable: false),
                    Precio = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    ConsumoWatts = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    CapacidadWatts = table.Column<decimal>(type: "numeric(10,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Componentes", x => x.ComponenteId);
                });

            migrationBuilder.CreateTable(
                name: "ArmadoComponentes",
                columns: table => new
                {
                    ArmadoId = table.Column<int>(type: "integer", nullable: false),
                    ComponenteId = table.Column<int>(type: "integer", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ArmadoComponentes", x => new { x.ArmadoId, x.ComponenteId });
                    table.ForeignKey(
                        name: "FK_ArmadoComponentes_Armados_ArmadoId",
                        column: x => x.ArmadoId,
                        principalTable: "Armados",
                        principalColumn: "ArmadoId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ArmadoComponentes_Componentes_ComponenteId",
                        column: x => x.ComponenteId,
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
                name: "IX_ArmadoComponentes_ComponenteId",
                table: "ArmadoComponentes",
                column: "ComponenteId");

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
                name: "ArmadoComponentes");

            migrationBuilder.DropTable(
                name: "Compatibilidades");

            migrationBuilder.DropTable(
                name: "Armados");

            migrationBuilder.DropTable(
                name: "Componentes");
        }
    }
}
