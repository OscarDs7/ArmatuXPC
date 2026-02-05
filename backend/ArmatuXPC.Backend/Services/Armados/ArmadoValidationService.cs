using ArmatuXPC.Backend.DTOs.Armados;
using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace ArmatuXPC.Backend.Services.Armados
{
    public class ArmadoValidationService : IArmadoValidationService
    {
        private readonly AppDbContext _context;

        public ArmadoValidationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ArmadoValidationResultDto> ValidateAsync(int armadoId)
        {
            var armado = await _context.Armados
                .Include(a => a.Procesador)
                .Include(a => a.PlacaBase)
                .Include(a => a.MemoriaRam)
                .Include(a => a.GPU)
                .Include(a => a.FuentePoder)
                .Include(a => a.Almacenamiento)
                .Include(a => a.Gabinete)
                .FirstOrDefaultAsync(a => a.ArmadoId == armadoId);

            var result = new ArmadoValidationResultDto
            {
                ArmadoId = armadoId,
                IsValid = true
            };

            if (armado == null)
            {
                result.IsValid = false;
                return result;
            }

            var componentes = new List<(int Id, string Nombre)>
            {
                (armado.Procesador?.ComponenteId ?? 0, armado.Procesador?.Nombre ?? ""),
                (armado.PlacaBase?.ComponenteId ?? 0, armado.PlacaBase?.Nombre ?? ""),
                (armado.MemoriaRam?.ComponenteId ?? 0, armado.MemoriaRam?.Nombre ?? ""),
                (armado.GPU?.ComponenteId ?? 0, armado.GPU?.Nombre ?? ""),
                (armado.FuentePoder?.ComponenteId ?? 0, armado.FuentePoder?.Nombre ?? ""),
                (armado.Almacenamiento?.ComponenteId ?? 0, armado.Almacenamiento?.Nombre ?? ""),
                (armado.Gabinete?.ComponenteId ?? 0, armado.Gabinete?.Nombre ?? "")
            }
            .Where(c => c.Id > 0)
            .ToList();

            var ids = componentes.Select(c => c.Id).ToList();

            var incompatibilidades = await _context.Compatibilidades
                .Where(c =>
                    ids.Contains(c.ComponenteAId) &&
                    ids.Contains(c.ComponenteBId) &&
                    !c.EsCompatible)
                .ToListAsync();

            foreach (var inc in incompatibilidades)
            {
                result.IsValid = false;

                // 1️⃣ Registrar error
                result.Errors.Add(new ArmadoErrorDto
                {
                    ComponenteAId = inc.ComponenteAId,
                    ComponenteBId = inc.ComponenteBId,
                    Motivo = inc.Motivo
                });

                // 2️⃣ Generar recomendación automática
                var componenteProblematicoId = inc.ComponenteBId;

                var componenteProblematico = componentes
                    .First(c => c.Id == componenteProblematicoId);

                var compatibles = await _context.Compatibilidades
                    .Where(c =>
                        c.ComponenteAId == inc.ComponenteAId &&
                        c.EsCompatible)
                    .Include(c => c.ComponenteB)
                    .Select(c => new RecommendedComponentDto
                    {
                        Id = c.ComponenteBId,
                        Nombre = c.ComponenteB.Nombre,
                        Marca = c.ComponenteB.Marca,
                        Modelo = c.ComponenteB.Modelo
                    })
                    .ToListAsync();

                result.Recommendations.Add(new ArmadoRecommendationDto
                {
                    ReplaceComponentId = componenteProblematicoId,
                    ReplaceComponentName = componenteProblematico.Nombre,
                    Suggestions = compatibles
                });
            }

            return result;
        }
    }
}
