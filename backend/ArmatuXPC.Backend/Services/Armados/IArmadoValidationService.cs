using ArmatuXPC.Backend.DTOs.Armados;
using ArmatuXPC.Backend.Models;


namespace ArmatuXPC.Backend.Services.Armados
{
    public interface IArmadoValidationService
    {
        Task<ArmadoValidationResultDto> ValidateAsync(int armadoId);
    }
}
