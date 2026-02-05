using ArmatuXPC.Backend.DTOs.Armados;
using System.Threading.Tasks;


namespace ArmatuXPC.Backend.Services.Armados
{
    public interface IArmadoValidationService
    {
        Task<ArmadoValidationResultDto> ValidateAsync(int armadoId);
    }
}
