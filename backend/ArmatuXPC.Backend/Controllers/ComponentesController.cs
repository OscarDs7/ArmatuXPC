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

        // GET: api/Componentes -> Recibe todos los 'Componentes' disponibles, con opción de filtrar por tipo
        // GET: api/Componentes?tipo=1
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComponenteDto>>> GetComponentes([FromQuery] TipoComponente? tipo)
        {
            var query = _context.Componentes.AsQueryable();

            if (tipo.HasValue)
                query = query.Where(c => c.Tipo == tipo.Value);

            var componentes = await query
                .Select(c => new ComponenteDto
                {
                    ComponenteId = c.ComponenteId,
                    Nombre = c.Nombre,
                    Marca = c.Marca,
                    Modelo = c.Modelo,
                    Precio = c.Precio,
                    Tipo = c.Tipo,
                    ConsumoWatts = c.ConsumoWatts,
                    CapacidadWatts = c.CapacidadWatts
                })
                .ToListAsync();

            return Ok(componentes);
        }

        // GET: api/Componentes/5 -> Recibe un 'Componente' específico por su ID
        [HttpGet("{id}")]
        public async Task<ActionResult<ComponenteDto>> GetComponente(int id)
        {
            var componente = await _context.Componentes
                .Where(c => c.ComponenteId == id)
                .Select(c => new ComponenteDto
                {
                    ComponenteId = c.ComponenteId,
                    Nombre = c.Nombre,
                    Marca = c.Marca,
                    Modelo = c.Modelo,
                    Precio = c.Precio,
                    Tipo = c.Tipo,
                    ConsumoWatts = c.ConsumoWatts,
                    CapacidadWatts = c.CapacidadWatts
                })
                .FirstOrDefaultAsync();

            if (componente == null)
                return NotFound();

            return Ok(componente);
        }

        // POST: api/Componentes -> Crea un nuevo 'Componente'
        [HttpPost]
        public async Task<ActionResult> PostComponente(ComponenteDto dto)
        {
            if (dto.Tipo == TipoComponente.FuentePoder && dto.CapacidadWatts == null)
                return BadRequest("La fuente debe tener CapacidadWatts");

            if (dto.Tipo != TipoComponente.FuentePoder && dto.CapacidadWatts != null)
                return BadRequest("Solo la fuente puede tener CapacidadWatts");

            var componente = new Componente
            {
                Nombre = dto.Nombre,
                Marca = dto.Marca,
                Modelo = dto.Modelo,
                Precio = dto.Precio,
                Tipo = dto.Tipo,
                ConsumoWatts = dto.ConsumoWatts,
                CapacidadWatts = dto.CapacidadWatts
            };

            _context.Componentes.Add(componente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetComponente),
                new { id = componente.ComponenteId },
                componente);
        }

        // PUT: api/Componentes/5 -> Actualiza un 'Componente' existente por su ID
        [HttpPut("{id}")]
        public async Task<IActionResult> PutComponente(int id, ComponenteDto dto)
        {
            var componente = await _context.Componentes.FindAsync(id);

            if (componente == null)
                return NotFound();

            if (dto.Tipo == TipoComponente.FuentePoder && dto.CapacidadWatts == null)
                return BadRequest("La fuente debe tener CapacidadWatts");

            componente.Nombre = dto.Nombre;
            componente.Marca = dto.Marca;
            componente.Modelo = dto.Modelo;
            componente.Precio = dto.Precio;
            componente.Tipo = dto.Tipo;
            componente.ConsumoWatts = dto.ConsumoWatts;
            componente.CapacidadWatts = dto.CapacidadWatts;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Componentes/5 -> Elimina un 'Componente' por su ID
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComponente(int id)
        {
            var componente = await _context.Componentes
                .Include(c => c.Armados)
                .FirstOrDefaultAsync(c => c.ComponenteId == id);

            if (componente == null)
                return NotFound();

            if (componente.Armados.Any())
                return BadRequest("No se puede eliminar el componente porque está siendo usado en uno o más armados");

            _context.Componentes.Remove(componente);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        
    }
}
