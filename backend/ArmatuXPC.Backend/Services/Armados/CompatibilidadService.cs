using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;

namespace ArmatuXPC.Backend.Services
{
    public class CompatibilidadService
    {
        private readonly AppDbContext _context;

        public CompatibilidadService(AppDbContext context)
        {
            _context = context;
        }

        // 🔥 Método principal reutilizable
       public async Task<List<CompatibilidadResultadoDto>> ObtenerCompatibles(
            int id,
            string? tipoDestino = null)
        {
            var reglas = await _context.Compatibilidades
                .Where(r =>
                    (r.ComponenteAId == id || r.ComponenteBId == id)
                    && r.EsCompatible)
                .ToListAsync();

            if (!reglas.Any())
                return new List<CompatibilidadResultadoDto>();

            var idsCompatibles = reglas
                .Select(r =>
                    r.ComponenteAId == id
                        ? r.ComponenteBId
                        : r.ComponenteAId)
                .ToList();

            var componentes = await _context.Componentes
                .Where(c => idsCompatibles.Contains(c.ComponenteId))
                .ToListAsync();

            if (!string.IsNullOrEmpty(tipoDestino))
            {
                componentes = componentes
                    .Where(c =>
                        c.Tipo.ToString()
                        .Equals(tipoDestino,
                            StringComparison.OrdinalIgnoreCase))
                    .ToList();
            }

            return componentes.Select(c =>
            {
                var regla = reglas.FirstOrDefault(r =>
                    r.ComponenteAId == c.ComponenteId
                    || r.ComponenteBId == c.ComponenteId);

                return new CompatibilidadResultadoDto
                {
                    ComponenteId = c.ComponenteId,
                    Nombre = c.Nombre,
                    Precio = c.Precio,
                    Tipo = c.Tipo.ToString(),
                    ImagenUrl = c.ImagenUrl ?? "",
                    Motivo = regla?.Motivo ?? "Compatible"
                };
            }).ToList();
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