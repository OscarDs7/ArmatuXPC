using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;

namespace ArmatuXPC.Backend.Controllers
{
    // API controller for managing 'Armado' entities
    [ApiController]
    [Route("api/[controller]")]
    public class CompatibilidadesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompatibilidadesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Compatibilidades -> Obtiene todos las compatibilidades entre componentes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Compatibilidad>>> GetCompatibilidades()
        {
            return await _context.Compatibilidades.ToListAsync();
        }

        // GET: api/Compatibilidades/5 -> Obtiene un armado por ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Compatibilidad>> GetCompatibilidades(int id)
        {
            var compatibilidad = await _context.Compatibilidades
                .FirstOrDefaultAsync(a => a.CompatibilidadId == id);

            if (compatibilidad == null)
            {
                return NotFound();
            }

            return compatibilidad;
        }

        // POST: api/Compatibilidad -> Crea un nuevo armado
        [HttpPost]
        public async Task<ActionResult<Armado>> PostArmado(Compatibilidad compatibilidad)
        {
            _context.Compatibilidades.Add(compatibilidad);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCompatibilidades),
                new { id = compatibilidad.CompatibilidadId },
                compatibilidad
            );
        }

        // PUT: api/Armados/5 -> Actualiza un armado
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCompatibilidad(int id, Compatibilidad compatibilidad)
        {
            if (id != compatibilidad.CompatibilidadId)
            {
                return BadRequest("El ID no coincide");
            }

            _context.Entry(compatibilidad).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CompatibilidadExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Armados/5 -> Elimina un armado
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompatibilidad(int id)
        {
            var compatibilidad = await _context.Compatibilidades
                .FirstOrDefaultAsync(a => a.CompatibilidadId == id);

            if (compatibilidad == null)
            {
                return NotFound();
            }

            _context.Compatibilidades.Remove(compatibilidad);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CompatibilidadExists(int id)
        {
            return _context.Armados.Any(e => e.ArmadoId == id);
        }
    }
}
