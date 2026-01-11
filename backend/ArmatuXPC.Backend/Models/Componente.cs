using System.Text.Json.Serialization;

namespace ArmatuXPC.Backend.Models
{
    public class Componente
    {
        public int ComponenteId { get; set; }

        public string Nombre { get; set; } = string.Empty;
        public string Marca { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public int Tipo { get; set; }
        public decimal Voltaje { get; set; }

        // === RELACIONES INVERSAS ===
        
        [JsonIgnore]
        public ICollection<Armado> ComoGabinete { get; set; } = new List<Armado>();

        [JsonIgnore]
        public ICollection<Armado> ComoPlacaBase { get; set; } = new List<Armado>();

        [JsonIgnore]
        public ICollection<Armado> ComoFuentePoder { get; set; } = new List<Armado>();

        [JsonIgnore]
        public ICollection<Armado> ComoMemoriaRam { get; set; } = new List<Armado>();

        [JsonIgnore]
        public ICollection<Armado> ComoProcesador { get; set; } = new List<Armado>();

        [JsonIgnore]
        public ICollection<Armado> ComoAlmacenamiento { get; set; } = new List<Armado>();

        [JsonIgnore]
        public ICollection<Armado> ComoGPU { get; set; } = new List<Armado>();
    }
}
