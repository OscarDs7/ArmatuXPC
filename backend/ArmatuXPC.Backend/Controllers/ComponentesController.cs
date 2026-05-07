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

        // --- ENDPOINT PARA USUARIOS (Tienda/Armador) ---
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ComponenteDto>>> GetComponentes([FromQuery] TipoComponente? tipo)
        {
            // Ya NO necesitas .Where(c => c.EstaActivo) porque el filtro global lo hace por ti.
            var query = _context.Componentes.AsQueryable();

            if (tipo.HasValue)
                query = query.Where(c => c.Tipo == tipo.Value);

            return Ok(await ProyectarADto(query).ToListAsync());
        }

        // --- ENDPOINT PARA ADMIN (Panel de Control) ---
        [HttpGet("admin/todos")]
        public async Task<ActionResult<IEnumerable<ComponenteDto>>> GetComponentesAdmin()
        {
            // No filtramos por 'EstaActivo', enviamos la lista completa
            // IMPORTANTE: Debes usar .IgnoreQueryFilters() para poder ver los inactivos
            var query = _context.Componentes
                .IgnoreQueryFilters() 
                .AsQueryable();

            return Ok(await ProyectarADto(query).ToListAsync());
        }

        // Método auxiliar para no repetir el código del 'Select'
        private IQueryable<ComponenteDto> ProyectarADto(IQueryable<Componente> query)
        {
            return query.Select(c => new ComponenteDto
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
            });
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
                ImagenUrl = dto.ImagenUrl,
                EstaActivo = dto.EstaActivo
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

        // ENDPOINT: Para restaurar el estado del componente que está desactivado en activo 
        // para su disponibilidad en tienda para el usuario.
        [HttpPut("{id}/restaurar")]
        public async Task<IActionResult> RestaurarComponente(int id)
        {
            var componente = await _context.Componentes
                .IgnoreQueryFilters() // encontrar el componente aunque esté desactivado en la BD
                .FirstOrDefaultAsync(c => c.ComponenteId == id);

            if (componente == null)  
                return NotFound(new { mensaje = "El componente no existe en la base de datos" });

            componente.EstaActivo = true; // Volvemos a habilitarlo

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { mensaje = "Componente restaurado correctamente" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al restaurar", detalle = ex.Message });
            }
        }

        // ENDPOINT: para eliminar un componente o darlo de baja de la tienda para el usuario
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
        } // fin-delete(id)
        
    }
}
