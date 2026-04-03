using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;
using ArmatuXPC.Backend.DTOs;
using ArmatuXPC.Backend.Services.Armados;
using Google.Cloud.Firestore;

namespace ArmatuXPC.Backend.Controllers
{
    // API controller for managing 'Usuario' entities
    [ApiController]
    // Route attribute to define the base route for the controller
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly FirestoreDb _firestoreDb;


        public UsuariosController(AppDbContext context, FirestoreDb firestoreDb)
        {
            _context = context;
            _firestoreDb = firestoreDb;
        }

        [HttpPost("recargar-tokens")]
        public async Task<IActionResult> RecargarTokens([FromBody] RecargaRequest request)
        {
            try
            {
                // 1. En el futuro, aquí validarías el 'PaymentId' con la API de Stripe
                // bool pagoExitoso = await _stripeService.ConfirmarPago(request.PaymentId);
                // if (!pagoExitoso) return BadRequest("Pago no verificado");   

                // 2. Referencia al usuario en Firestore (No toca SQL, va directo a Firebase)
                DocumentReference userRef = _firestoreDb.Collection("Usuario").Document(request.UsuarioUid);
                
                // 3. Incrementamos los tokens (ejemplo: el paquete comprado trae 5 tokens)
                // Usamos Increment para evitar problemas de concurrencia
                await userRef.UpdateAsync("TokensDisponibles", FieldValue.Increment(request.CantidadComprada));

                return Ok(new { 
                    mensaje = $"¡Recarga exitosa! Se han añadido {request.CantidadComprada} tokens.",
                    nuevoSaldoTotal = "Actualizándose..." 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al procesar la recarga", detalle = ex.Message });
            }
        }

    }
}
