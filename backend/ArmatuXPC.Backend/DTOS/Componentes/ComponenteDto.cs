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
    public decimal? CapacidadWatts { get; set; }
    public string? ImagenUrl { get; set; }
    public bool EstaActivo {get; set; }
    
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
