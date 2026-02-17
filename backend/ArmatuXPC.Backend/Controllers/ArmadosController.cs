using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;
using ArmatuXPC.Backend.DTOs;
using ArmatuXPC.Backend.Services.Armados;

namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArmadosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IArmadoEnergiaService _armadoEnergiaService;

        public ArmadosController(
            AppDbContext context, 
            IArmadoEnergiaService armadoEnergiaService)
        {
            _context = context;
            _armadoEnergiaService = armadoEnergiaService;
        }

        // ===============================
        // MÉTODO PRIVADO REUTILIZABLE
        // ===============================
        private async Task<List<object>> EvaluarCompatibilidad(int armadoId)
        {
            // Cargar el armado con sus componentes
            var armado = await _context.Armados
                .Include(a => a.Componentes)
                    .ThenInclude(ac => ac.Componente)
                .FirstOrDefaultAsync(a => a.ArmadoId == armadoId);

            // Si el armado no existe o tiene menos de 2 componentes, no hay incompatibilidades que evaluar
            if (armado == null)
                return new List<object>();

            var ids = armado.Componentes
                .Select(ac => ac.ComponenteId)
                .ToList();

            if (ids.Count < 2)
                return new List<object>();

            // Buscar todas las reglas de incompatibilidad que apliquen a cualquier par de componentes en el armado
            var reglas = await _context.Compatibilidades
                .Where(r =>
                    ids.Contains(r.ComponenteAId) &&
                    ids.Contains(r.ComponenteBId) &&
                    !r.EsCompatible)
                .Include(r => r.ComponenteA)
                .Include(r => r.ComponenteB)
                .ToListAsync();

            return reglas.Select(r => new
            {
                componenteA = r.ComponenteA!.Nombre,
                componenteB = r.ComponenteB!.Nombre,
                motivo = r.Motivo
            }).Cast<object>().ToList();
        }


        // ===============================
        // GET TODOS
        // ===============================
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArmadoDto>>> GetArmados()
        {
            var armados = await _context.Armados
                .Include(a => a.Componentes)
                    .ThenInclude(ac => ac.Componente)
                .Select(a => new ArmadoDto
                {
                    ArmadoId = a.ArmadoId,
                    UsuarioId = a.UsuarioId,
                    NombreArmado = a.NombreArmado,
                    Componentes = a.Componentes
                        .Select(ac => new ArmadoComponenteDto
                        {
                            ComponenteId = ac.ComponenteId,
                            Nombre = ac.Componente.Nombre,
                            Marca = ac.Componente.Marca,
                            Modelo = ac.Componente.Modelo,
                            Tipo = ac.Componente.Tipo,
                            Precio = ac.Componente.Precio,
                            ConsumoWatts = ac.Componente.ConsumoWatts,
                            CapacidadWatts = ac.Componente.CapacidadWatts,
                            Cantidad = ac.Cantidad
                        })
                        .ToList()
                })
                .ToListAsync();

            return Ok(armados);
        }

        // ===============================
        // VALIDAR COMPATIBILIDAD
        // ===============================
        [HttpGet("{id}/validarCompatibilidad")]
        public async Task<ActionResult> ValidarCompatibilidad(int id)
        {
            var armado = await _context.Armados
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.ArmadoId == id);

            if (armado == null)
                return NotFound("Armado no encontrado");

            var errores = await EvaluarCompatibilidad(id);

            return Ok(new
            {
                armadoId = id,
                esValido = !errores.Any(),
                errores
            });
        }

        // ===============================
        // POST
        // ===============================
        [HttpPost]
        public async Task<ActionResult> PostArmado(CrearArmadoDto dto)
        {
            var armado = new Armado
            {
                UsuarioId = dto.UsuarioId,
                NombreArmado = dto.NombreArmado,
                Componentes = dto.Componentes.Select(c => new ArmadoComponente
                {
                    ComponenteId = c.ComponenteId,
                    Cantidad = c.Cantidad
                }).ToList()
            };

            _context.Armados.Add(armado);
            await _context.SaveChangesAsync();

            //var errores = await EvaluarCompatibilidad(armado.ArmadoId); // Evaluar compatibilidad después de guardar para obtener el ID generado
            /*
            if (errores.Any())
            {
                return BadRequest(new
                {
                    mensaje = "El armado tiene componentes incompatibles",
                    errores
                });
            }*/

            // Validar consumo energético después de guardar para obtener el ID generado para ver si el consumo total excede la capacidad de la fuente de poder
            try
            {
                await _armadoEnergiaService
                    .ValidarArmadoEnergeticamenteAsync(armado.ArmadoId);
            }
            catch (Exception ex)
            {
                _context.Armados.Remove(armado);
                await _context.SaveChangesAsync();
                return BadRequest(new
                {
                    mensaje = "Error energético",
                    detalle = ex.Message
                });
            }


            return CreatedAtAction(nameof(GetArmados), new { id = armado.ArmadoId }, armado);
        }


        // ===============================
        // PUT
        // ===============================
        [HttpPut("{id}")]
        public async Task<IActionResult> PutArmado(int id, CrearArmadoDto dto)
        {
            var armado = await _context.Armados
                .Include(a => a.Componentes)
                .FirstOrDefaultAsync(a => a.ArmadoId == id);

            if (armado == null)
                return NotFound();

            armado.NombreArmado = dto.NombreArmado;
            armado.UsuarioId = dto.UsuarioId;

            // Eliminar componentes actuales
            _context.ArmadoComponentes.RemoveRange(armado.Componentes);

            // Agregar nuevos
            armado.Componentes = dto.Componentes.Select(c => new ArmadoComponente
            {
                ArmadoId = id,
                ComponenteId = c.ComponenteId,
                Cantidad = c.Cantidad
            }).ToList();

            await _context.SaveChangesAsync();

            var errores = await EvaluarCompatibilidad(id);
            var resumen = await GetResumen(id);

            if (errores.Any())
            {
                return BadRequest(new
                {
                    mensaje = "El armado tiene componentes incompatibles",
                    errores
                });
            }

            return NoContent();
        }

        // ===============================
        // DELETE
        // ===============================
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArmado(int id)
        {
            var armado = await _context.Armados
                .Include(a => a.Componentes)
                .FirstOrDefaultAsync(a => a.ArmadoId == id);

            if (armado == null)
                return NotFound();

            _context.ArmadoComponentes.RemoveRange(armado.Componentes);
            _context.Armados.Remove(armado);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        //  ================================
        // NUEVO ENDPOINT: RESUMEN ENERGÉTICO
        // =================================

        [HttpGet("{id}/resumen")]
        public async Task<ActionResult> GetResumen(int id)
        {
            var resumen = await _armadoEnergiaService.GetResumenEnergeticoAsync(id);

            if (resumen == null)
                return NotFound("Armado no encontrado");

            return Ok(resumen);
        }


    } // ArmadosController
} // namespace ArmatuXPC.Backend.Controllers
