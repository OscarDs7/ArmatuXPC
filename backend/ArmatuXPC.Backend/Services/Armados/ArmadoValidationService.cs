using ArmatuXPC.Backend.DTOs.Armados;
using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Models;

namespace ArmatuXPC.Backend.Services.Armados
{
    public class ArmadoValidationService : IArmadoValidationService
    {
        private readonly AppDbContext _context;

        public ArmadoValidationService(AppDbContext context)
        {
            _context = context;
        }

        // helper privado para obtener componentes del armado
        private List<Componente> GetComponentesDelArmado(Armado armado)
        {
            return new List<Componente?>
            {
                armado.Procesador,
                armado.PlacaBase,
                armado.MemoriaRam,
                armado.GPU,
                armado.FuentePoder,
                armado.Almacenamiento,
                armado.Gabinete
            }
            .Where(c => c != null)
            .Cast<Componente>()
            .ToList();
        } // GetComponentesDelArmado

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

        var componentes = GetComponentesDelArmado(armado);
        var ids = componentes.Select(c => c.ComponenteId).ToList();

        var incompatibilidades = await _context.Compatibilidades
            .Where(c =>
                !c.EsCompatible &&
                ids.Contains(c.ComponenteAId) &&
                ids.Contains(c.ComponenteBId))
            .ToListAsync();

        foreach (var inc in incompatibilidades)
        {
            result.IsValid = false;

            // ❌ Error
            result.Errors.Add(new ArmadoErrorDto
            {
                ComponenteAId = inc.ComponenteAId,
                ComponenteBId = inc.ComponenteBId,
                Motivo = inc.Motivo
            });

            await GenerarRecomendacion(inc, componentes, result);
        }

        return result;
    }

    // Generar recomendaciones basadas en incompatibilidades
    private async Task GenerarRecomendacion(
        Compatibilidad inc,
        List<Componente> componentes,
        ArmadoValidationResultDto result)
    {
        var componenteProblematico = componentes
            .First(c => c.ComponenteId == inc.ComponenteBId);

        var alternativas = await _context.Compatibilidades
            .Where(c =>
                c.ComponenteAId == inc.ComponenteAId &&
                c.EsCompatible)
            .Include(c => c.ComponenteB)
            .Where(c => c.ComponenteB != null && c.ComponenteB.Tipo == componenteProblematico.Tipo)
            .Select(c => new RecommendedComponentDto
            {
                Id = c.ComponenteBId,
                Nombre = c.ComponenteB!.Nombre,
                Marca = c.ComponenteB!.Marca,
                Modelo = c.ComponenteB!.Modelo
            })
            .ToListAsync();

        if (!alternativas.Any())
            return;

        result.Recommendations.Add(new ArmadoRecommendationDto
        {
            ReplaceComponentId = componenteProblematico.ComponenteId,
            ReplaceComponentName = componenteProblematico.Nombre,
            Suggestions = alternativas
        });
    } // GenerarRecomendacion

    } // ArmadoValidationService

} // namespace ArmatuXPC.Backend.Services.Armados
