using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;
using ArmatuXPC.Backend.DTOs;

namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompatibilidadesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CompatibilidadesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Compatibilidades
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Compatibilidad>>> GetCompatibilidades()
        {
            return await _context.Compatibilidades.ToListAsync();
        }

        // GET: api/Compatibilidades/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Compatibilidad>> GetCompatibilidad(int id)
        {
            var compatibilidad = await _context.Compatibilidades
                .FirstOrDefaultAsync(c => c.CompatibilidadId == id);

            if (compatibilidad == null)
                return NotFound();

            return compatibilidad;
        }

        // POST: api/Compatibilidades
        [HttpPost]
        public async Task<IActionResult> CreateCompatibilidad(
            [FromBody] CompatibilidadCreateDto dto)
        {
            if (dto.ComponenteAId == dto.ComponenteBId)
                return BadRequest("Un componente no puede validarse contra sí mismo.");

            // Verificar si ya existe A-B o B-A
            var existe = await _context.Compatibilidades.AnyAsync(c =>
                (c.ComponenteAId == dto.ComponenteAId &&
                c.ComponenteBId == dto.ComponenteBId)
                ||
                (c.ComponenteAId == dto.ComponenteBId &&
                c.ComponenteBId == dto.ComponenteAId));

            if (existe)
                return BadRequest("Ya existe una regla entre estos componentes.");

            var compatibilidad = new Compatibilidad
            {
                ComponenteAId = dto.ComponenteAId,
                ComponenteBId = dto.ComponenteBId,
                Motivo = dto.Motivo,
                EsCompatible = dto.EsCompatible
            };

            _context.Compatibilidades.Add(compatibilidad);
            await _context.SaveChangesAsync();

            return Ok(compatibilidad);
        }

        // PUT: api/Compatibilidades/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCompatibilidad(int id, Compatibilidad compatibilidad)
        {
            if (id != compatibilidad.CompatibilidadId)
                return BadRequest("El ID no coincide");

            var db = await _context.Compatibilidades.FindAsync(id);
            if (db == null)
                return NotFound();

            // Actualiza solo los campos reales
            db.ComponenteAId = compatibilidad.ComponenteAId;
            db.ComponenteBId = compatibilidad.ComponenteBId;
            db.EsCompatible = compatibilidad.EsCompatible;
            db.Motivo = compatibilidad.Motivo;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/Compatibilidades/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompatibilidad(int id)
        {
            var compatibilidad = await _context.Compatibilidades.FindAsync(id);
            if (compatibilidad == null)
                return NotFound();

            _context.Compatibilidades.Remove(compatibilidad);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CompatibilidadExists(int id)
        {
            return _context.Compatibilidades.Any(e => e.CompatibilidadId == id);
        }
    }
}
