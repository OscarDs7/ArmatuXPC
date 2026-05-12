// DTO para representar un armado con sus componentes
// Este DTO se utiliza para enviar la información de un armado completo, incluyendo los detalles de cada componente, al cliente.

namespace ArmatuXPC.Backend.DTOs;
using ArmatuXPC.Backend.Models;

public class ArmadoDto
{
    public int ArmadoId { get; set; }
    public string UsuarioId { get; set; } = string.Empty;
    public string NombreArmado { get; set; } = string.Empty;
    public string AutorNombre { get; set; } = string.Empty;
    public bool EsPublicado { get; set; }
    public DateTime FechaCreacion { get; set; }

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
    public decimal? CapacidadWatts { get; set; }
    public int Cantidad { get; set; }
    public string? ImagenUrl { get; set; } = string.Empty;

    // --- NUEVOS ATRIBUTOS TÉCNICOS PARA EL CHATBOT ---
        
    // Para CPU y Placa Base (ej: "LGA1700", "AM5")
    public string? Socket { get; set; }

    // Para Placa Base y RAM (ej: "DDR4", "DDR5")
    public string? TipoMemoria { get; set; }

    // Para Placa Base (ej: "Z690", "B650") o GPUs (PCIe 4.0)
    public string? Chipset { get; set; }

    // Para Gabinetes y Placas (ej: "ATX", "Micro-ATX", "Mini-ITX")
    public string? FactorForma { get; set; }
}
