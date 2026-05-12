using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
// Asegúrate de importar el namespace donde tengas tu Enum TipoComponente
using ArmatuXPC.Backend.Models; 

namespace ArmatuXPC.Backend.Services
{
    public class CompatibilidadService
    {
        private readonly AppDbContext _context;

        public CompatibilidadService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<CompatibilidadResultadoDto>> ObtenerCompatibles(int id, string? tipoDestino = null)
        {
            // 1. Intentar convertir el string a tu Enum ANTES de consultar la BD.
            // Esto permite que EF Core traduzca la comparación correctamente a SQL.
            TipoComponente? tipoEnum = null;
            if (!string.IsNullOrEmpty(tipoDestino) && Enum.TryParse<TipoComponente>(tipoDestino, true, out var parsedEnum))
            {
                tipoEnum = parsedEnum;
            }

            // 2. Construir la consulta en un solo viaje a la base de datos (Queryable)
            var query = from r in _context.Compatibilidades
                        // Filtramos las reglas válidas para este ID
                        where (r.ComponenteAId == id || r.ComponenteBId == id) && r.EsCompatible == true
                        
                        // Determinamos cuál es el ID del componente "pareja"
                        let idCompatible = r.ComponenteAId == id ? r.ComponenteBId : r.ComponenteAId
                        
                        // Hacemos Join directo con la tabla de componentes
                        join c in _context.Componentes on idCompatible equals c.ComponenteId
                        
                        // Aplicamos el filtro de tipo AQUÍ (se ejecutará en el motor SQL)
                        where (tipoEnum == null || c.Tipo == tipoEnum)
                             && c.EstaActivo

                        orderby c.Nombre

                        // Proyectamos directamente al DTO
                        select new CompatibilidadResultadoDto
                        {
                            ComponenteId = c.ComponenteId,
                            Nombre = c.Nombre,
                            Precio = c.Precio,
                            Tipo = tipoDestino ?? c.Tipo.ToString(),
                            ImagenUrl = c.ImagenUrl ?? "",
                            Motivo = r.Motivo ?? "Compatible"
                        };

            // 3. Ejecutamos la consulta final
            return await query
                .GroupBy(c => c.ComponenteId)
                .Select(g => g.OrderByDescending(x => x.Motivo.Length).First()) // O una lógica que asegure el compatible
                .ToListAsync();
        }
    }
}

public class CompatibilidadResultadoDto
{
    public int ComponenteId { get; set; }

    public string Nombre { get; set; } = "";

    public decimal Precio { get; set; }

    public string Tipo { get; set; } = "";

    public string ImagenUrl { get; set; } = "";

    public string Motivo { get; set; } = "";
}