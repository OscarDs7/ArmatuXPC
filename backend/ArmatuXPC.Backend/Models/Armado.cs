using System.ComponentModel.DataAnnotations.Schema;

namespace ArmatuXPC.Backend.Models
{
    public class Armado
    {
        // Propiedades principales de la entidad Armado
        public int ArmadoId { get; set; }

        public int UsuarioId { get; set; }
        public string NombreArmado { get; set; } = string.Empty;

        // LLAVES FORÁNEAS HACIA COMPONENTES //

        // === GABINETE ===
        public int? GabineteId { get; set; }

        [ForeignKey(nameof(GabineteId))]
        public Componente? Gabinete { get; set; }

        // === PLACA BASE ===
        public int? PlacaBaseId { get; set; }

        [ForeignKey(nameof(PlacaBaseId))]
        public Componente? PlacaBase { get; set; }

        // === FUENTE ===
        public int? FuentePoderId { get; set; }

        [ForeignKey(nameof(FuentePoderId))]
        public Componente? FuentePoder { get; set; }

        // === RAM ===
        public int? MemoriaRamId { get; set; }

        [ForeignKey(nameof(MemoriaRamId))]
        public Componente? MemoriaRam { get; set; }

        // === CPU ===
        public int? ProcesadorId { get; set; }

        [ForeignKey(nameof(ProcesadorId))]
        public Componente? Procesador { get; set; }

        // === STORAGE ===
        public int? AlmacenamientoId { get; set; }

        [ForeignKey(nameof(AlmacenamientoId))]
        public Componente? Almacenamiento { get; set; }

        // === GPU ===
        public int? GPUId { get; set; } 

        [ForeignKey(nameof(GPUId))]
        public Componente? GPU { get; set; }
    }
}
