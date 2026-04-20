using System.ComponentModel.DataAnnotations;

namespace ArmatuXPC.Backend.Models 
{
    public class Usuario
    {
        [Key] // Define que este es el identificador único
        public string Uid { get; set; } = string.Empty; // El UID que viene de Firebase

        [Required]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Correo { get; set; } = string.Empty;

        public DateTime? FechaRegistro { get; set; }

        public int TokensDisponibles { get; set; }
        
        // Propiedad opcional para el Rol (si lo manejas en la DB)
        public string Rol { get; set; } = string.Empty;
    }
}