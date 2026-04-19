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
            // 1. Iniciamos la consulta filtrando SIEMPRE por los activos
            var query = _context.Componentes
                .Where(c => c.EstaActivo) // Borrado lógico global
                .AsQueryable();

            // 2. Aplicamos el filtro de tipo solo si viene en la petición
            if (tipo.HasValue)
            {
                query = query.Where(c => c.Tipo == tipo.Value);
            }

            // 3. Proyectamos al DTO
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
                    CapacidadWatts = c.CapacidadWatts,
                    ImagenUrl = c.ImagenUrl, 
                    EstaActivo = c.EstaActivo
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
                    CapacidadWatts = c.CapacidadWatts,
                    ImagenUrl = c.ImagenUrl
                })
                .FirstOrDefaultAsync();

            if (componente == null)
                return NotFound();

            return Ok(componente);
        }

        // POST: api/Componentes -> Crea un nuevo 'Componente'
        [HttpPost]
        public async Task<ActionResult> PostComponente([FromBody] ComponenteDto dto)
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
                CapacidadWatts = dto.CapacidadWatts,
                ImagenUrl = dto.ImagenUrl
            };
            Console.WriteLine("Tipo recibido: " + dto.Tipo);

            Console.WriteLine("Imagen recibida: " + dto.ImagenUrl);

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

       [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteComponente(int id)
        {
            // 1. Buscamos el componente
            var componente = await _context.Componentes.FindAsync(id);

            // 2. Si no existe, 404
            if (componente == null)
                return NotFound(new { mensaje = $"No se encontró el componente con ID {id}" });

            // 3. Opcional: Si ya está desactivado, podemos retornar éxito de inmediato
            if (!componente.EstaActivo)
                return NoContent(); 

            // 4. Aplicamos el borrado lógico
            componente.EstaActivo = false;

            try
            {
                // No hace falta Entry().State si el objeto viene de FindAsync
                await _context.SaveChangesAsync();
                return NoContent(); 
            }
            catch (Exception ex)
            {
                // Loguear el error 'ex' aquí si tienes un logger
                return StatusCode(500, new { 
                    mensaje = "Error interno al procesar la baja lógica", 
                    detalle = ex.Message 
                });
            }
        }
        
    }
}
