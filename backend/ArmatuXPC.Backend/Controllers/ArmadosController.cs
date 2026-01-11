using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;

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

        // GET: api/Armados -> Obtiene todos los armados
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Armado>>> GetArmados()
        {
            return await _context.Armados.ToListAsync();
        }

        // GET: api/Armados/5 -> Obtiene un armado por ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Armado>> GetArmado(int id)
        {
            var armado = await _context.Armados
                .FirstOrDefaultAsync(a => a.ArmadoId == id);

            if (armado == null)
            {
                return NotFound();
            }

            return armado;
        }

        // POST: api/Armados -> Crea un nuevo armado
        [HttpPost]
        public async Task<ActionResult<Armado>> PostArmado(Armado armado)
        {
            _context.Armados.Add(armado);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetArmado),
                new { id = armado.ArmadoId },
                armado
            );
        }

        // PUT: api/Armados/5 -> Actualiza un armado
        [HttpPut("{id}")]
        public async Task<IActionResult> PutArmado(int id, Armado armado)
        {
            if (id != armado.ArmadoId)
            {
                return BadRequest("El ID no coincide");
            }

            _context.Entry(armado).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ArmadoExists(id))
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
