namespace ArmatuXPC.Backend.Models;

public class Compatibilidad
{
    public int CompatibilidadId { get; set; }

    // Componente A
    public int ComponenteAId { get; set; } // Foreign key
    public Componente ComponenteA { get; set; } = null!; // Navigation property

    // Componente B
    public int ComponenteBId { get; set; } // Foreign key
    public Componente ComponenteB { get; set; } = null!; // Navigation property
    public bool EsCompatible { get; set; } // Es compatible o no
    public string Motivo { get; set; } = string.Empty; // Razón de la incompatibilidad
}
