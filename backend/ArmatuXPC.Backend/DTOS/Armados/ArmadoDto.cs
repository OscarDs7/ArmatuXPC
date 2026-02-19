// DTO para representar un armado con sus componentes
// Este DTO se utiliza para enviar la información de un armado completo, incluyendo los detalles de cada componente, al cliente.

namespace ArmatuXPC.Backend.DTOs;
using ArmatuXPC.Backend.Models;

public class ArmadoDto
{
    public int ArmadoId { get; set; }
    public int UsuarioId { get; set; }
    public string NombreArmado { get; set; } = string.Empty;

    public List<ArmadoComponenteDto> Componentes { get; set; } = new();
}


public class ArmadoComponenteDto
{
    public int ComponenteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public TipoComponente Tipo { get; set; }
    public decimal Precio { get; set; }
    public decimal? ConsumoWatts { get; set; }
    public int? CapacidadWatts { get; set; }
    public int Cantidad { get; set; }
}
