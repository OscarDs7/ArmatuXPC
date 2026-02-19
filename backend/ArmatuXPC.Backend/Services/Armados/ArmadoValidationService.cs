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
        
         // GetComponentesDelArmado
        public async Task<ArmadoValidationResultDto> ValidateAsync(int armadoId)
{
        // Cargar el armado con sus componentes
        var armado = await _context.Armados
            .Include(a => a.Componentes) // Cargar la relación ArmadoComponentes
                .ThenInclude(ac => ac.Componente) // Cargar los detalles de cada Componente
            .FirstOrDefaultAsync(a => a.ArmadoId == armadoId); // Buscar el armado por su ID

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

        var componentes = armado.Componentes
            .Select(ac => ac.Componente) // Extraer solo los objetos Componente
            .ToList(); // Convertir a lista para facilitar la manipulación

        var ids = componentes
            .Select(c => c.ComponenteId) // Extraer solo los IDs de los componentes
            .ToList(); // Convertir a lista para usar en consultas posteriores

        // Si el armado tiene menos de 2 componentes, no hay incompatibilidades que evaluar
        if (ids.Count < 2)
            return result;

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
            .FirstOrDefault(c => c.ComponenteId == inc.ComponenteBId);

        // Si el componente problemático no se encuentra (lo cual sería raro, pero mejor prevenir), no se pueden generar recomendaciones
         if (componenteProblematico == null)
             return;

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
                Modelo = c.ComponenteB!.Modelo,
                Precio = c.ComponenteB!.Precio
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
