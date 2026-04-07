using Microsoft.AspNetCore.Mvc;
using ArmatuXPC.Backend.DTOs;
using Google.Cloud.Firestore;
using Stripe;
using Stripe.Checkout;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Data;
using ArmatuXPC.Backend.Models;


namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/Usuarios")]
    public class UsuariosController : ControllerBase
    {
        private readonly FirestoreDb _firestoreDb;
        private readonly AppDbContext _context;

        public UsuariosController(FirestoreDb firestoreDb, AppDbContext context)
        {
            _firestoreDb = firestoreDb;
            _context = context;
        }

        // 1. Iniciar la sesión de pago
        // El frontend envía el UID del usuario, la cantidad de tokens que quiere comprar, y el precio en centavos.
       [HttpPost("crear-sesion-pago")]
        public async Task<IActionResult> CrearSesionPago([FromBody] RecargaRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.UsuarioUid))
                {
                    return BadRequest(new { mensaje = "Datos inválidos." });
                }

                // --- HARDENING: Definimos los precios reales en el servidor ---
                long precioRealCentavos = 0;
                
                // Usamos un switch para validar que solo se compren paquetes permitidos
                switch (request.CantidadComprada)
                {
                    case 3:
                        precioRealCentavos = 4900; // $49.00 MXN
                        break;
                    case 10:
                        precioRealCentavos = 12900; // $129.00 MXN
                        break;
                    case 30:
                        precioRealCentavos = 19900; // $199.00 MXN
                        break;
                    case 50:
                        precioRealCentavos = 24900; // $249.00 MXN
                        break;
                    case 100:
                        precioRealCentavos = 29900; // $299.00 MXN
                        break;
                    default:
                        // Si intentan comprar una cantidad que no existe en el catálogo
                        return BadRequest(new { mensaje = "Ese paquete no está disponible." });
                }

                var options = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                // Usamos nuestra variable validada, NO request.PrecioCentavos
                                UnitAmount = precioRealCentavos, 
                                Currency = "mxn",
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = $"Paquete de {request.CantidadComprada} Tokens - ArmatuXPC",
                                },
                            },
                            Quantity = 1,
                        },
                    },
                    Mode = "payment",
                    SuccessUrl = $"http://localhost:5173/pago-exitoso?session_id={{CHECKOUT_SESSION_ID}}&uid={request.UsuarioUid}&tokens={request.CantidadComprada}",
                    CancelUrl = "http://localhost:5173/comprar-tokens",
                    Metadata = new Dictionary<string, string>
                    {
                        { "usuarioUid", request.UsuarioUid },
                        { "cantidadTokens", request.CantidadComprada.ToString() }
                    }
                };

                var service = new SessionService();
                Session session = await service.CreateAsync(options);

                return Ok(new { url = session.Url });
            }
            catch (StripeException e)
            {
                return BadRequest(new { mensaje = e.StripeError.Message });
            }
        }

        // 2. Validar el pago y dar los tokens
        // El frontend redirige a esta ruta después del pago exitoso, con el session_id, uid y tokens en query params.
        [HttpGet("confirmar-pago")]
        public async Task<IActionResult> ConfirmarPago([FromQuery] string sessionId, [FromQuery] string uid, [FromQuery] int tokens)
        {
            try
            {
                var service = new SessionService();
                var session = await service.GetAsync(sessionId);

                if (session.PaymentStatus == "paid")
                {
                    DocumentReference userRef = _firestoreDb.Collection("Usuario").Document(uid);
                    
                    // Línea comentada para evitar problemas de tokens dobles. El webhook se encargará de sumar los tokens una vez que Stripe confirme el pago.
                    //await userRef.UpdateAsync("TokensDisponibles", FieldValue.Increment(tokens));

                    return Ok(new { mensaje = "Tokens acreditados exitosamente" });
                }

                return BadRequest("El pago no se ha completado.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "Error al confirmar pago", detalle = ex.Message });
            }
        }
        
        // 3. Webhook de Stripe (opcional pero recomendado para seguridad)
        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            // 1. Leer el cuerpo de la petición (el JSON que manda Stripe)
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            
            // Leer la clave del .env
            var endpointSecret = Environment.GetEnvironmentVariable("Stripe__WebhookSecret");

            try
            {
                // 2. Validar que la petición REALMENTE venga de Stripe (Seguridad)
                // Necesitarás una "Webhook Secret" que te da el dashboard de Stripe
                var stripeEvent = EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    endpointSecret // Asegúrate de que esta variable esté en tu .env y se esté leyendo correctamente en Program.cs
                );
                Console.WriteLine($"DEBUG: La clave que estoy usando es: {endpointSecret}");

                // 3. Si el evento es "Sesión de Checkout Completada"
                if (stripeEvent.Type == EventTypes.CheckoutSessionCompleted)
                {
                    var session = stripeEvent.Data.Object as Stripe.Checkout.Session;

                    // VALIDACIÓN DE SEGURIDAD
                    if (session?.Metadata != null && 
                        session.Metadata.ContainsKey("usuarioUid") && 
                        session.Metadata.ContainsKey("cantidadTokens"))
                    {
                        var uid = session.Metadata["usuarioUid"];
                        var tokensStr = session.Metadata["cantidadTokens"];

                        if (int.TryParse(tokensStr, out int tokens))
                        {
                            DocumentReference userRef = _firestoreDb.Collection("Usuario").Document(uid);
                            await userRef.UpdateAsync("TokensDisponibles", FieldValue.Increment(tokens));
                            Console.WriteLine($"✅ ÉXITO: {tokens} tokens sumados al usuario {uid}");
                        }
                    }
                    else 
                    {
                        Console.WriteLine("⚠️ Webhook recibido pero faltan metadatos (usuarioUid o cantidadTokens).");
                    }
                }

                return Ok();
            }
            catch (StripeException e)
            {
                Console.WriteLine($"❌ Error de Stripe: {e.Message}");
                return BadRequest();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR CRÍTICO EN WEBHOOK: {ex.Message}");
                Console.WriteLine($"🔍 STACKTRACE: {ex.StackTrace}");
                return StatusCode(500);
            }
        }

        // Nuevo endpoint para sincronizar el método handleRegistro() y handleLogin() con la tabla Usuarios del backend
        [HttpPost("sincronizar")]
        public async Task<IActionResult> SincronizarUsuario([FromBody] Usuario usuarioDto)
        {
            try
            {
                // 1. Buscamos si el usuario ya existe en nuestra DB local
                var usuarioExistente = await _context.Usuarios
                    .FirstOrDefaultAsync(u => u.Uid == usuarioDto.Uid);

                if (usuarioExistente == null)
                {
                    // 2. Si no existe, lo agregamos (Primer registro)
                    _context.Usuarios.Add(usuarioDto);
                }
                else
                {
                    // 3. Si existe, actualizamos sus datos básicos por si cambiaron
                    usuarioExistente.Nombre = usuarioDto.Nombre;
                    usuarioExistente.Correo = usuarioDto.Correo;
                    // No tocamos los tokens aquí para no sobrescribir el saldo actual
                }

                await _context.SaveChangesAsync();
                return Ok(new { mensaje = "Usuario sincronizado con éxito" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error de sincronización: {ex.Message}");
            }
        }
        
        // NUEVO ENDPOINT para obtener estadísticas de los usuarios y saber cuáles son los más activos dentro de la plataforma
        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardUserStats()
        {
            try 
            {
                // Conteo total de usuarios registrados
                var totalUsuarios = await _context.Usuarios.CountAsync();

                // Usuarios que han interactuado creando proyectos (Engagement)
                var usuariosActivos = await _context.Armados
                    .Select(a => a.UsuarioId)
                    .Distinct()
                    .CountAsync();

                // Identificar al Power User (Top Contribuidor)
                var topUserGroup = await _context.Armados
                    .GroupBy(a => a.UsuarioId)
                    .Select(g => new { 
                        Id = g.Key, 
                        Conteo = g.Count() 
                    })
                    .OrderByDescending(x => x.Conteo)
                    .FirstOrDefaultAsync();

                string nombreTop = "N/A";
                int cantidadTop = 0;

                if (topUserGroup != null)
                {
                    // Buscamos al usuario ignorando mayúsculas/minúsculas para asegurar el match
                    var perfil = await _context.Usuarios
                        .FirstOrDefaultAsync(u => u.Uid.ToLower() == topUserGroup.Id.ToLower());
                    
                    nombreTop = perfil?.Nombre ?? "Usuario Anónimo";
                    cantidadTop = topUserGroup.Conteo;
                }

                return Ok(new {
                    total = totalUsuarios,
                    activos = usuariosActivos,
                    topUsuario = new {
                        nombre = nombreTop,
                        cantidad = cantidadTop
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error en dashboard-stats: {ex.Message}"); 
                return StatusCode(500, "Error al generar indicadores de usuario");
            }
        }
    }
}