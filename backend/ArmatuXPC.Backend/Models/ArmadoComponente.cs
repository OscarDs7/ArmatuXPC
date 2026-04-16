using System.Text.Json.Serialization;

namespace ArmatuXPC.Backend.Models
{
    public class ArmadoComponente
    {
        public int ArmadoId { get; set; }
        
        [JsonIgnore] // 👈 ESTO ROMPE EL BUCLE INFINITO
        public Armado Armado { get; set; } = null!;

        public int ComponenteId { get; set; }
        public Componente Componente { get; set; } = null!;

        // Cantidad del componente en el armado, por ejemplo, 2 módulos de RAM o 2 unidades de almacenamiento
        public int Cantidad { get; set; } = 1;
    }
}
