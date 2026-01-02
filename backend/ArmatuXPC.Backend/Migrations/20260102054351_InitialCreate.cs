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
                    NombreArmado = table.Column<string>(type: "text", nullable: false),
                    GabineteId = table.Column<int>(type: "integer", nullable: false),
                    PlacaBaseId = table.Column<int>(type: "integer", nullable: false),
                    FuentePoderId = table.Column<int>(type: "integer", nullable: false),
                    MemoriaRamId = table.Column<int>(type: "integer", nullable: false),
                    ProcesadorId = table.Column<int>(type: "integer", nullable: false),
                    AlmacenamientoId = table.Column<int>(type: "integer", nullable: false),
                    GPUId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Armados", x => x.ArmadoId);
                });

            migrationBuilder.CreateTable(
                name: "Compatibilidades",
                columns: table => new
                {
                    CompatibilidadId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdComponente = table.Column<int>(type: "integer", nullable: false),
                    MarcaComponente = table.Column<string>(type: "text", nullable: false),
                    MarcaIncompatible = table.Column<string>(type: "text", nullable: false),
                    RazonIncompatibilidad = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Compatibilidades", x => x.CompatibilidadId);
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
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Voltaje = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Componentes", x => x.ComponenteId);
                });
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
