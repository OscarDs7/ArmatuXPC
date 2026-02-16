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
        public decimal Voltaje { get; set; }

        // === RELACIONES INVERSAS ===
        
        [JsonIgnore] public ICollection<Armado> ComoGabinete { get; set; } = new List<Armado>();
        [JsonIgnore] public ICollection<Armado> ComoPlacaBase { get; set; } = new List<Armado>();
        [JsonIgnore] public ICollection<Armado> ComoFuentePoder { get; set; } = new List<Armado>();
        [JsonIgnore] public ICollection<Armado> ComoMemoriaRam { get; set; } = new List<Armado>();
        [JsonIgnore] public ICollection<Armado> ComoProcesador { get; set; } = new List<Armado>();
        [JsonIgnore] public ICollection<Armado> ComoAlmacenamiento { get; set; } = new List<Armado>();
        [JsonIgnore] public ICollection<Armado> ComoGPU { get; set; } = new List<Armado>();
    }
}
