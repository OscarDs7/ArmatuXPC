using System.Text.Json.Serialization;

namespace ArmatuXPC.Backend.Models;

public class Compatibilidad
{
    public int CompatibilidadId { get; set; }

    public int ComponenteAId { get; set; }
    public int ComponenteBId { get; set; }

    [JsonIgnore]
    public Componente? ComponenteA { get; set; }   // 👈 nullable

    [JsonIgnore]
    public Componente? ComponenteB { get; set; }   // 👈 nullable

    public string Motivo { get; set; } = string.Empty;
    public bool EsCompatible { get; set; }
}
