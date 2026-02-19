// Archivo generado para realizar todas las operaciones enfocadas en el resumen energético de un armado,
// como calcular el consumo total, validar que no se exceda la capacidad de la fuente de poder, etc.

using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.DTOs.Armados;
using Microsoft.EntityFrameworkCore;

namespace ArmatuXPC.Backend.Services.Armados
{
    public class ArmadoEnergiaService : IArmadoEnergiaService
    {
        private readonly AppDbContext _context;

        public ArmadoEnergiaService(AppDbContext context)
        {
            _context = context;
        }

        // 🔹 MÉTODO NÚCLEO (Single Source of Truth)
        public async Task<(decimal consumoTotal, decimal? capacidadFuente)>
            CalcularConsumoAsync(int armadoId)
        {
            var armado = await _context.Armados
                .Include(a => a.Componentes)
                    .ThenInclude(ac => ac.Componente)
                .FirstOrDefaultAsync(a => a.ArmadoId == armadoId);

            if (armado == null)
                throw new Exception("Armado no encontrado");

            decimal consumoTotal = 0;
            decimal? capacidadFuente = null;

            foreach (var item in armado.Componentes)
            {
                var componente = item.Componente;

                if (componente.CapacidadWatts.HasValue)
                {
                    // Es fuente de poder
                    capacidadFuente = componente.CapacidadWatts.Value;
                }
                else if (componente.ConsumoWatts.HasValue)
                {
                    // Es un componente consumidor que hace la suma total de consumo
                    consumoTotal += componente.ConsumoWatts.Value * item.Cantidad;
                }
            }

            return (consumoTotal, capacidadFuente);
        }


        // 🔹 RESUMEN ENERGÉTICO (usa el método núcleo)
        public async Task<ArmadoResumenDto?> GetResumenEnergeticoAsync(int armadoId)
        {
            var (consumoTotal, capacidadFuente) =
                await CalcularConsumoAsync(armadoId);

            decimal margenRecomendado = consumoTotal * 1.2m;

            bool fuenteSuficiente =
                capacidadFuente.HasValue &&
                capacidadFuente.Value >= margenRecomendado;

            return new ArmadoResumenDto
            {
                ArmadoId = armadoId,
                ConsumoTotalWatts = consumoTotal,
                CapacidadFuenteWatts = capacidadFuente,
                MargenRecomendadoWatts = margenRecomendado,
                FuenteSuficiente = fuenteSuficiente
            };
        }


        // 🔹 VALIDACIÓN PARA PREVENIR GUARDADO INCORRECTO
        public async Task ValidarArmadoEnergeticamenteAsync(int armadoId)
        {
            var resumen = await GetResumenEnergeticoAsync(armadoId);

            if (resumen == null)
                throw new Exception("Armado no encontrado");

            if (!resumen.FuenteSuficiente)
            {
                throw new Exception(
                    $"Fuente insuficiente. " +
                    $"Consumo con margen: {resumen.MargenRecomendadoWatts}W. " +
                    $"Capacidad fuente: {resumen.CapacidadFuenteWatts ?? 0}W."
                );
            }
        }
        
    }
}
