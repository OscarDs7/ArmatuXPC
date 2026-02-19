using ArmatuXPC.Backend.Models;
public class ComponenteDto
{
    public int ComponenteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public TipoComponente Tipo { get; set; }
    public decimal? ConsumoWatts { get; set; }
    public int? CapacidadWatts { get; set; }
}
