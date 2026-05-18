using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations.Schema;


namespace ArmatuXPC.Backend.Models
{
    public class Componente
    {
        public int ComponenteId { get; set; }

        public string Nombre { get; set; } = string.Empty;
        public string Marca { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Precio { get; set; } // Precio por individual
        public TipoComponente Tipo { get; set; } // 1: Procesador, 2: Tarjeta Gráfica (GPU), 3: Memoria RAM, 4: Almacenamiento, 5: Fuente de Poder, 6: Placa Base, 7: Gabinete
        
        // --- ATRIBUTOS DE ENERGÍA ---

        // Consumo en watts del componente (CPU, RAM, GPU, Almacenamiento, Placa Base), para calcular el consumo total del armado   
        public int? ConsumoWatts { get; set; }

        public int? CapacidadWatts { get; set; } // Potencia total en watts que puede suministrar la fuente de poder, para validar que sea suficiente para el armado

        // --- NUEVOS ATRIBUTOS TÉCNICOS PARA EL CHATBOT ---
        
        // Para CPU y Placa Base (ej: "LGA1700", "AM5")
        public string? Socket { get; set; }

        // Para Placa Base y RAM (ej: "DDR4", "DDR5")
        public string? TipoMemoria { get; set; }

        // Para Placa Base (ej: "Z690", "B650") o GPUs (PCIe 4.0)
        public string? Chipset { get; set; }

        // Para Gabinetes y Placas (ej: "ATX", "Micro-ATX", "Mini-ITX")
        public string? FactorForma { get; set; }

        // --- IMAGEN Y ESTADO ---
        
        // Imagen del componente (URL o base64), para mostrar en el frontend
        public string? ImagenUrl { get; set; }

        // Nueva propiedad para el borrado lógico
        public bool EstaActivo { get; set; } = true;


        // Relación con ArmadoComponente (muchos a muchos)
        public ICollection<ArmadoComponente> Armados { get; set; } = new List<ArmadoComponente>();
    }
}
