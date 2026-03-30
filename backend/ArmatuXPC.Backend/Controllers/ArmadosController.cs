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
                    AutorNombre = a.AutorNombre,
                    FechaCreacion = a.FechaCreacion,
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

        // GET: api/Armados/usuario/uid de usuario Firebase
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult> GetArmadosPorUsuario(string usuarioId)
        {
            try 
            {
                var misArmados = await _context.Armados
                    .Where(a => a.UsuarioId == usuarioId)
                    .Include(a => a.Componentes)
                    .ThenInclude(ac => ac.Componente) // Importante para traer los datos del componente real
                    .Select(a => new {
                        a.ArmadoId,
                        a.NombreArmado,
                        a.AutorNombre,
                        FechaCreacion = a.FechaCreacion, 
                        EsPublicado = a.EsPublicado,
                        Componentes = a.Componentes.Select(ac => new {
                            ac.ComponenteId,
                            Nombre = ac.Componente.Nombre,
                            Precio = ac.Componente.Precio,
                            Tipo = ac.Componente.Tipo.ToString(), // Lo enviamos como texto para React
                            Cantidad = ac.Cantidad
                        })
                    })
                    .ToListAsync();

                return Ok(misArmados);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al obtener los armados", detalle = ex.Message });
            }
        }

        // ===============================
        // VALIDAR COMPATIBILIDAD
        // ===============================
        [HttpGet("{id}/validarCompatibilidadArmado")]
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
        public async Task<ActionResult<Armado>> PostArmado(CrearArmadoDto armadoDto)
        {
            try
            {
                var nuevoArmado = new Armado
                {
                    UsuarioId = armadoDto.UsuarioId,
                    NombreArmado = armadoDto.NombreArmado,
                    AutorNombre = armadoDto.AutorNombre,
                    FechaCreacion = DateTime.UtcNow // Mantén UtcNow para Postgres
                };

                foreach (var item in armadoDto.Componentes)
                {
                    nuevoArmado.Componentes.Add(new ArmadoComponente
                    {
                        ComponenteId = item.ComponenteId,
                        Cantidad = item.Cantidad
                    });
                }

                _context.Armados.Add(nuevoArmado);
                await _context.SaveChangesAsync();

                // Devolvemos el ID y el nombre para confirmar éxito al frontend
                return Ok(new { 
                    nuevoArmado.ArmadoId, 
                    nuevoArmado.NombreArmado, 
                    mensaje = "Armado guardado con éxito" 
                });
            }
            catch (Exception ex)
            {
                var errorReal = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"[ERROR CRÍTICO]: {errorReal}");
                return StatusCode(500, new { detalle = errorReal });
            }
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
        // ENDPOINT: RESUMEN ENERGÉTICO
        // =================================

        [HttpGet("{id}/resumen")]
        public async Task<ActionResult> GetResumen(int id)
        {
            var resumen = await _armadoEnergiaService.GetResumenEnergeticoAsync(id);

            if (resumen == null)
                return NotFound("Armado no encontrado");

            return Ok(resumen);
        }

        // ===============================
        // ENDPOINT: EVALUAR COMPATIBILIDAD EN TIEMPO REAL
        // ===============================
        [HttpPost("evaluar-compatibilidad-tiempo-real")]
        public async Task<IActionResult> EvaluarCompatibilidadTiempoReal([FromBody] List<int> componenteIds)
        {
            if (componenteIds == null || componenteIds.Count < 2)
                return Ok(new List<object>());

            var reglas = await _context.Compatibilidades
                .Where(r =>
                    (!r.EsCompatible) &&
                    (
                        (componenteIds.Contains(r.ComponenteAId) && componenteIds.Contains(r.ComponenteBId)) ||
                        (componenteIds.Contains(r.ComponenteBId) && componenteIds.Contains(r.ComponenteAId))
                    )
                )
                .Include(r => r.ComponenteA)
                .Include(r => r.ComponenteB)
                .ToListAsync();

            var resultado = reglas.Select(r => new
            {
                componenteA = r.ComponenteA!.Nombre,
                componenteB = r.ComponenteB!.Nombre,
                motivo = r.Motivo
            });

            return Ok(resultado);
        }

        // ENDPOINT: PUBLICAR ARMADO EN LA INTERFAZ DE LA COMUNIDAD
        [HttpPost("{id}/publicar")]
        public async Task<IActionResult> PublicarArmado(
            [FromRoute] int id, 
            [FromQuery] string nombreUsuario) 
        {
            // El código interno se queda igual
            var armado = await _context.Armados.FindAsync(id);
            if (armado == null) return NotFound();

            // Si el nombre viene vacío, podrías poner uno por defecto o devolver un error
            nombreUsuario = string.IsNullOrWhiteSpace(nombreUsuario) ? "Usuario Anónimo" : nombreUsuario;
            // Actualizamos el estado de publicación y el nombre del autor
            armado.EsPublicado = true;
            armado.AutorNombre = nombreUsuario; 

            await _context.SaveChangesAsync();
            return Ok(new { mensaje = "¡Publicado!", autor = armado.AutorNombre });
        }

        // ENDPOINT: OBTENER ARMADOS PUBLICADOS EN LA COMUNIDAD
        [HttpGet("comunidad")]
        public async Task<ActionResult<IEnumerable<ArmadoDto>>> GetComunidad()
        {
            // Agregamos los Includes para evitar NullReferenceException en los componentes
            var armados = await _context.Armados
                    .Include(a => a.Componentes)
                    .ThenInclude(c => c.Componente)
                .Where(a => a.EsPublicado)
                .Select(a => new ArmadoDto {
                    ArmadoId = a.ArmadoId,
                    UsuarioId = a.UsuarioId,
                    NombreArmado = a.NombreArmado,
                    AutorNombre = a.AutorNombre, // Ahora sí lo reconocerá
                    FechaCreacion = a.FechaCreacion,
                    // Mapeamos los componentes con sus detalles para el DTO
                    Componentes = a.Componentes.Select(c => new ArmadoComponenteDto {
                        ComponenteId = c.ComponenteId,
                        Nombre = c.Componente.Nombre,
                        Marca = c.Componente.Marca,
                        Modelo = c.Componente.Modelo,
                        Tipo = c.Componente.Tipo,
                        Precio = c.Componente.Precio,
                        ConsumoWatts = c.Componente.ConsumoWatts,
                        CapacidadWatts = c.Componente.CapacidadWatts,
                        Cantidad = c.Cantidad,
                        ImagenUrl = c.Componente.ImagenUrl // Asegúrate de que esta propiedad exista en tu modelo Componente
                    }).ToList()
                })
                .ToListAsync();
            return Ok(armados);
        }

        // ENDPOINT: DESPUBLICAR ARMADO DE LA INTERFAZ DE LA COMUNIDAD
        [HttpPost("{id}/despublicar")]
        public async Task<IActionResult> DespublicarArmado(int id)
        {
            var armado = await _context.Armados.FindAsync(id);

            if (armado == null) return NotFound();

            armado.EsPublicado = false;
            armado.AutorNombre = string.Empty; // Limpiamos el nombre del autor al despublicar

            await _context.SaveChangesAsync();

            return Ok(new { mensaje = "Tu armado ha sido retirado de la comunidad." });
        }


    } // ArmadosController
} // namespace ArmatuXPC.Backend.Controllers
