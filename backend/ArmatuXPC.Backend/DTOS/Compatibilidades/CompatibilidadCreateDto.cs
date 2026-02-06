namespace ArmatuXPC.Backend.DTOs;

using ArmatuXPC.Backend.Models;

public class CompatibilidadCreateDto
{
    public int ComponenteAId { get; set; }
    public int ComponenteBId { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public bool EsCompatible { get; set; }
}
