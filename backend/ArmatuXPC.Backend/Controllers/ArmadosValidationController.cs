// Código generado por ArmatuXPC - Plataforma de Armados Personalizados para PC

using ArmatuXPC.Backend.Services.Armados;
using Microsoft.AspNetCore.Mvc;

namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/armados/validation")]
    public class ArmadosValidationController : ControllerBase
    {
        private readonly IArmadoValidationService _validationService;

        public ArmadosValidationController(IArmadoValidationService validationService)
        {
            _validationService = validationService;
        }

        /// <summary>
        /// Valida compatibilidad de un armado y devuelve errores y recomendaciones
        /// </summary>
        [HttpGet("{armadoId}")]
        public async Task<IActionResult> Validate(int armadoId)
        {
            var result = await _validationService.ValidateAsync(armadoId);
            return Ok(result);
        }
    }
}
