using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;

namespace ArmatuXPC.Backend.Controllers
{
    // API controller for managing 'Componente' entities
    [ApiController]
    // Route attribute to define the base route for the controller
    [Route("api/[controller]")]
    public class ComponentesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ComponentesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Componentes -> Recibe todo los 'Componentes'
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Componente>>> GetComponentes()
        {
            return await _context.Componentes.ToListAsync();
        }

        // GET: api/Componentes/5 -> Recibe un 'Componente' por su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Componente>> GetComponente(int id)
        {
            var componente = await _context.Componentes
                .FirstOrDefaultAsync(c => c.ComponenteId == id);

            if (componente == null)
            {
                return NotFound();
            }

            return componente;
        }

        // POST: api/Componentes -> Crea un nuevo 'Componente'
        [HttpPost]
        public async Task<ActionResult<Componente>> PostComponente([FromBody] Componente componente)
        {
            _context.Componentes.Add(componente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetComponente),
                new { id = componente.ComponenteId },
                componente
            );
        }

        // PUT: api/Componentes/5 -> Actualiza un 'Componente' existente por su ID
        [HttpPut("{id}")]
        public async Task<IActionResult> PutComponente(int id, Componente componente)
        {
            if (id != componente.ComponenteId)
            {
                return BadRequest("El ID no coincide");
            }

            _context.Entry(componente).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ComponenteExists(id))
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

        // DELETE: api/Componentes/5 -> Elimina un 'Componente' por su ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComponente(int id)
        {
            var componente = await _context.Componentes
                .FirstOrDefaultAsync(c => c.ComponenteId == id);

            if (componente == null)
            {
                return NotFound();
            }

            _context.Componentes.Remove(componente);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ComponenteExists(int id)
        {
            return _context.Componentes.Any(e => e.ComponenteId == id);
        }
    }
}
