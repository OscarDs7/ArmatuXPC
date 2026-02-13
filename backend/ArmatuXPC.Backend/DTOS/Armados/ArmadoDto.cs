namespace ArmatuXPC.Backend.DTOs;
using ArmatuXPC.Backend.Models;

public class ArmadoDto
{
    public int ArmadoId { get; set; }
    public int UsuarioId { get; set; }
    public required string NombreArmado { get; set; }

    public required ComponentesDto Componentes { get; set; }
}

public class ComponentesDto
{
    public Componente? Procesador { get; set; }
    public Componente? PlacaBase { get; set; }
    public Componente? GPU { get; set; }
    public Componente? MemoriaRam { get; set; }
    public Componente? Almacenamiento { get; set; }
    public Componente? FuentePoder { get; set; }
    public Componente? Gabinete { get; set; }
}
