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
        
        // Consumo en watts del componente (CPU, RAM, GPU, Almacenamiento, Placa Base), para calcular el consumo total del armado
        [Column(TypeName = "decimal(10,2)")]       
        public decimal? ConsumoWatts { get; set; }

        // Solo para fuente de poder
        [Column(TypeName = "decimal(10,2)")]
        public int? CapacidadWatts { get; set; } // Potencia total en watts que puede suministrar la fuente de poder, para validar que sea suficiente para el armado

        // Relación con ArmadoComponente (muchos a muchos)
        public ICollection<ArmadoComponente> Armados { get; set; } = new List<ArmadoComponente>();
    }
}
