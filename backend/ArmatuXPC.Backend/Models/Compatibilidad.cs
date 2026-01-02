namespace ArmatuXPC.Backend.Models
{
    public class Compatibilidad
    {
        public int CompatibilidadId { get; set; } 
        public string MarcaComponente { get; set; } = string.Empty;
        public string MarcaIncompatible { get; set; } = string.Empty;  
        public string RazonIncompatibilidad { get; set; } = string.Empty;

        // FOREIGN KEYS
        public int ComponenteId { get; set; }

        // Navigation property
        public Componente Componente { get; set; } = null!;
    }
}
