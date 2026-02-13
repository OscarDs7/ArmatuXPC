using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;
using ArmatuXPC.Backend.DTOs;

namespace ArmatuXPC.Backend.Controllers
{
    // API controller for managing 'Armado' entities
    [ApiController]
    [Route("api/[controller]")]
    public class ArmadosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ArmadosController(AppDbContext context)
        {
            _context = context;
        }

        // Lógica para evaluar la compatibilidad de un armado (Lógica reutilizable)
        private async Task<List<object>> EvaluarCompatibilidad(Armado armado)
        {
            var componentes = new List<Componente?>
            {
                armado.Gabinete,
                armado.PlacaBase,
                armado.FuentePoder,
                armado.MemoriaRam,
                armado.Procesador,
                armado.Almacenamiento,
                armado.GPU
            }
            .Where(c => c != null)
            .ToList();

            var ids = componentes.Select(c => c!.ComponenteId).ToList();

            var reglas = await _context.Compatibilidades
                .Where(r =>
                    ids.Contains(r.ComponenteAId) &&
                    ids.Contains(r.ComponenteBId) &&
                    r.EsCompatible == false)
                .Include(r => r.ComponenteA)
                .Include(r => r.ComponenteB)
                .ToListAsync();

            return reglas.Select(r => new
            {
                componenteA = r.ComponenteA?.Nombre,
                componenteB = r.ComponenteB?.Nombre,
                motivo = r.Motivo
            }).Cast<object>().ToList();
        }


        // GET: api/Armados -> Obtiene todos los armados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArmadoDto>>> GetArmados()
        {
            var armados = await _context.Armados
                // Select para mapear a ArmadoDto
                .Select(a => new ArmadoDto
                {
                    ArmadoId = a.ArmadoId,
                    UsuarioId = a.UsuarioId,
                    NombreArmado = a.NombreArmado,
                    Componentes = new ComponentesDto
                    {
                        Procesador = a.Procesador,
                        PlacaBase = a.PlacaBase,
                        GPU = a.GPU,
                        MemoriaRam = a.MemoriaRam,
                        Almacenamiento = a.Almacenamiento,
                        FuentePoder = a.FuentePoder,
                        Gabinete = a.Gabinete
                    }
                })
                .ToListAsync();

            return armados;
        } // final_GetArmados

        // GET: api/Armados/5/validarCompatibilidad -> Valida la compatibilidad de un armado
        [HttpGet("{id}/validarCompatibilidad")]
        public async Task<ActionResult> ValidarCompatibilidad(int id)
        {
            var armado = await _context.Armados
                .Include(a => a.Gabinete)
                .Include(a => a.PlacaBase)
                .Include(a => a.FuentePoder)
                .Include(a => a.MemoriaRam)
                .Include(a => a.Procesador)
                .Include(a => a.Almacenamiento)
                .Include(a => a.GPU)
                .FirstOrDefaultAsync(a => a.ArmadoId == id);

            if (armado == null)
                return NotFound("Armado no encontrado");

            var errores = await EvaluarCompatibilidad(armado);

            return Ok(new
            {
                armadoId = id,
                esValido = !errores.Any(),
                errores
            });
        }

        // POST: api/Armados -> Crea un nuevo armado
        [HttpPost]
        public async Task<ActionResult<Armado>> PostArmado(Armado armado)
        {
            // Convertir IDs en entidades reales
            armado.Gabinete = armado.GabineteId != null
                ? await _context.Componentes.FindAsync(armado.GabineteId)
                : null;

            armado.PlacaBase = armado.PlacaBaseId != null
                ? await _context.Componentes.FindAsync(armado.PlacaBaseId)
                : null;

            armado.FuentePoder = armado.FuentePoderId != null
                ? await _context.Componentes.FindAsync(armado.FuentePoderId)
                : null;

            armado.MemoriaRam = armado.MemoriaRamId != null
                ? await _context.Componentes.FindAsync(armado.MemoriaRamId)
                : null;

            armado.Procesador = armado.ProcesadorId != null
                ? await _context.Componentes.FindAsync(armado.ProcesadorId)
                : null;

            armado.Almacenamiento = armado.AlmacenamientoId != null
                ? await _context.Componentes.FindAsync(armado.AlmacenamientoId)
                : null;

            armado.GPU = armado.GPUId != null
                ? await _context.Componentes.FindAsync(armado.GPUId)
                : null;

            // Validar compatibilidad
            //var errores = await EvaluarCompatibilidad(armado);
            /*
            if (errores.Any())
            {
                return BadRequest(new
                {
                    mensaje = "El armado tiene componentes incompatibles",
                    errores
                });
            }*/

            _context.Armados.Add(armado);
            await _context.SaveChangesAsync();

            return Ok(armado);
        }
        // final_PostArmado


       // PUT: api/Armados/5 -> Actualiza un armado
        [HttpPut("{id}")]
        public async Task<IActionResult> PutArmado(int id, Armado armado)
        {
            if (id != armado.ArmadoId)
                return BadRequest("El ID no coincide");

            var armadoDb = await _context.Armados
                .Include(a => a.Gabinete)
                .Include(a => a.PlacaBase)
                .Include(a => a.FuentePoder)
                .Include(a => a.MemoriaRam)
                .Include(a => a.Procesador)
                .Include(a => a.Almacenamiento)
                .Include(a => a.GPU)
                .FirstOrDefaultAsync(a => a.ArmadoId == id);

            if (armadoDb == null)
                return NotFound();

            // Aplicar cambios
            armadoDb.NombreArmado = armado.NombreArmado;
            armadoDb.GabineteId = armado.GabineteId;
            armadoDb.PlacaBaseId = armado.PlacaBaseId;
            armadoDb.FuentePoderId = armado.FuentePoderId;
            armadoDb.MemoriaRamId = armado.MemoriaRamId;
            armadoDb.ProcesadorId = armado.ProcesadorId;
            armadoDb.AlmacenamientoId = armado.AlmacenamientoId;
            armadoDb.GPUId = armado.GPUId;

            // Volver a cargar relaciones
            armadoDb.Gabinete = armado.GabineteId != null
                ? await _context.Componentes.FindAsync(armado.GabineteId)
                : null;

            armadoDb.PlacaBase = armado.PlacaBaseId != null
                ? await _context.Componentes.FindAsync(armado.PlacaBaseId)
                : null;

            armadoDb.FuentePoder = armado.FuentePoderId != null
                ? await _context.Componentes.FindAsync(armado.FuentePoderId)
                : null;

            armadoDb.MemoriaRam = armado.MemoriaRamId != null
                ? await _context.Componentes.FindAsync(armado.MemoriaRamId)
                : null;

            armadoDb.Procesador = armado.ProcesadorId != null
                ? await _context.Componentes.FindAsync(armado.ProcesadorId)
                : null;

            armadoDb.Almacenamiento = armado.AlmacenamientoId != null
                ? await _context.Componentes.FindAsync(armado.AlmacenamientoId)
                : null;

            armadoDb.GPU = armado.GPUId != null
                ? await _context.Componentes.FindAsync(armado.GPUId)
                : null;


            var errores = await EvaluarCompatibilidad(armadoDb);

            if (errores.Any())
            {
                return BadRequest(new
                {
                    mensaje = "El armado tiene componentes incompatibles",
                    errores
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }



        // DELETE: api/Armados/5 -> Elimina un armado
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteArmado(int id)
        {
            var armado = await _context.Armados
                .FirstOrDefaultAsync(a => a.ArmadoId == id);

            if (armado == null)
            {
                return NotFound();
            }

            _context.Armados.Remove(armado);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ArmadoExists(int id)
        {
            return _context.Armados.Any(e => e.ArmadoId == id);
        }
    }
}
