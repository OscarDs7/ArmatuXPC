using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;

namespace ArmatuXPC.Backend.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly AppDbContext _context; // contexto de BD

        public FeedbackController(AppDbContext context) { _context = context; }

        [HttpPost]
        public async Task<IActionResult> PostFeedback([FromBody] FeedbackUsuario feedback)
        {
            try 
            {
                // Forzamos la fecha por si acaso el modelo tuviera problemas al deserializar
                feedback.Fecha = DateTime.Now; 

                _context.Feedbacks.Add(feedback);
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "¡Feedback recibido con éxito!" });
            }
            catch (Exception ex)
            {
                // Esto aparecerá en la consola de Visual Studio (Debug)
                // y te dirá el error real (si es de base de datos, de validación, etc.)
                var errorReal = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                return StatusCode(500, new { error = errorReal });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FeedbackUsuario>>> GetFeedbacks()
        {
            // Traemos los feedbacks ordenados por fecha descendente
            return await _context.Feedbacks
                .OrderByDescending(f => f.Fecha)
                .ToListAsync();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null) return NotFound();

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Feedback eliminado" });
        }
    }
}