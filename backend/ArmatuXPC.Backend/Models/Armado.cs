using System.ComponentModel.DataAnnotations.Schema;

namespace ArmatuXPC.Backend.Models
{
    public class Armado
    {
        // Propiedades principales de la entidad Armado
        public int ArmadoId { get; set; }

        public int UsuarioId { get; set; }
        public string NombreArmado { get; set; } = string.Empty;

        // Relación de uno a muchos con ArmadoComponente
        public ICollection<ArmadoComponente> Componentes { get; set; } = new List<ArmadoComponente>();
    }
}
