using ArmatuXPC.Backend.DTOs.Armados;

namespace ArmatuXPC.Backend.Services.Armados
{
    public interface IArmadoEnergiaService
    {
        Task<(decimal consumoTotal, decimal? capacidadFuente)>
            CalcularConsumoAsync(int armadoId);

        Task<ArmadoResumenDto?>
            GetResumenEnergeticoAsync(int armadoId);

        Task
            ValidarArmadoEnergeticamenteAsync(int armadoId);
    }
}
