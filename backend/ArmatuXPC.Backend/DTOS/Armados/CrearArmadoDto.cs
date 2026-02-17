// Archivo generado para representar la estructura de datos necesaria para crear un nuevo armado a través de la API con el método POST
// Contiene el ID del usuario que crea el armado, el nombre del armado y una lista de componentes con sus cantidades
public class CrearArmadoDto
{
    public int UsuarioId { get; set; }
    public string NombreArmado { get; set; } = string.Empty;

    public List<ComponenteCantidadDto> Componentes { get; set; } = new();
}

public class ComponenteCantidadDto
{
    public int ComponenteId { get; set; }
    public int Cantidad { get; set; }
}
