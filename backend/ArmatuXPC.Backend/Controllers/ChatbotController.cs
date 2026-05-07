using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text;
using System.Text.Json;
using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Models;


namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/chatbot")]
    public class ChatbotController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;


        public ChatbotController(IHttpClientFactory httpClientFactory, AppDbContext context)
        {
            _context = context;
            _httpClient = httpClientFactory.CreateClient("OllamaClient");
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            // Variables necesarias para el mensaje de usuario y el contexto del stock del negocio
            string mensajeUsuario = request.Mensaje.ToLower(); // Convertimos a minúsculas para facilitar la detección de palabras clave
            string contextoInventario = ""; // Aquí construiremos un resumen del stock relevante para el mensaje del usuario

            // 1. Detección de intención para consultar la base de datos del negocio
            // Diccionario de sinónimos para mapear palabras del usuario a tus Enums
            if (mensajeUsuario.Contains("procesador") || mensajeUsuario.Contains("cpu"))
            {
                contextoInventario = await ConsultarInventarioInterno("CPU");
            }
            else if (mensajeUsuario.Contains("memoria ram") || mensajeUsuario.Contains("ram"))
            {
                contextoInventario = await ConsultarInventarioInterno("MemoriaRAM");
            }
            else if (mensajeUsuario.Contains("tarjeta gráfica") || mensajeUsuario.Contains("gpu"))
            {
                contextoInventario = await ConsultarInventarioInterno("GPU");
            }
            else if (mensajeUsuario.Contains("disco duro") || mensajeUsuario.Contains("ssd") || mensajeUsuario.Contains("hdd"))
            {
                contextoInventario = await ConsultarInventarioInterno("Almacenamiento");
            }
            else if (mensajeUsuario.Contains("placa base") || mensajeUsuario.Contains("motherboard") || mensajeUsuario.Contains("tarjeta madre"))
            {
                contextoInventario = await ConsultarInventarioInterno("PlacaBase");
            }
            else if (mensajeUsuario.Contains("fuente de alimentación")  || mensajeUsuario.Contains("fuente de poder") || mensajeUsuario.Contains("fuente") || mensajeUsuario.Contains("psu"))
            {
                contextoInventario = await ConsultarInventarioInterno("FuentePoder");
            }
            else if (mensajeUsuario.Contains("refrigeración") || mensajeUsuario.Contains("cooler") || mensajeUsuario.Contains("ventilador") || mensajeUsuario.Contains("disipador"))
            {
                contextoInventario = await ConsultarInventarioInterno("Refrigeracion");
            }
            else if (mensajeUsuario.Contains("caja") || mensajeUsuario.Contains("gabinete") || mensajeUsuario.Contains("case"))
            {
                contextoInventario = await ConsultarInventarioInterno("Gabinete");
            }

            // 2. Construcción del mensaje para Ollama, incluyendo el contexto del inventario si se detectó una intención relevante
            // Definir la instrucción con jerarquía de datos
           string systemInstruction =
                "Eres el experto técnico de ArmatuXPC.\n\n" +

                "REGLAS:\n" +
                "1. Prioriza productos del inventario.\n" +
                "2. Si no hay stock, sugiere alternativas externas.\n" +
                "3. Responde en español, técnico y amigable.\n" +
                "4. Máximo 3-5 oraciones.\n" +
                "5. No repitas palabras ni cortes términos.\n\n" +

                "FORMATO DE RESPUESTA ANTE RECOMENDACIONES:\n" +
                "Recomendación 1:\n- Nombre:\n- Precio:\n- Descripción:\n\n" +
                "Recomendación 2:\n- Nombre:\n- Precio:\n- Descripción:\n\n" +

                "FORMATO DE RESPUESTA ANTE PREGUNTAS DE DESCRIPCIÓN O FUNCIONALIDAD:\n" +
                "Respuesta:\n- Descripción:\n- Funcionalidad:\n\n" +

                "FORMATO DE RESPUESTA ANTE PREGUNTAS NO RELACIONADAS CON LO TÉCNICO:\n" +
                "Respuesta:\nNo estoy programado para responder preguntas externas de lo relacionado con la platforma.\n\n" +

                "FORMATO DE RESPUESTA COMPATIBILIDAD:\n" +
                "Componente 1:\n- Nombre:\n- Precio:\n- Descripción:\n -Compatibilidad:\n" +
                "Componente 2:\n- Nombre:\n- Precio:\n- Descripción:\n -Compatibilidad:\n\n" +

                "INVENTARIO DISPONIBLE:\n" +
                (string.IsNullOrEmpty(contextoInventario)
                    ? "SIN STOCK"
                    : contextoInventario);
                        
            // Construimos el payload para Ollama, incluyendo el contexto del sistema
            var payload = new
            {
                model = "llama3.2",
                // El formato exacto que Llama 3.2 reconoce:
                prompt = $"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{systemInstruction}<|eot_id|>" +
                        $"<|start_header_id|>user<|end_header_id|>\n\n{request.Mensaje}<|eot_id|>" +
                        $"<|start_header_id|>assistant<|end_header_id|>\n\n",
                options = new { temperature = 0.2, num_predict = 400, top_p = 0.9, stop = new[] { "<|eot_id|>", "<|start_header_id|>" } },
                stream = false
            };
            
            // Enviamos la solicitud a Ollama para generar la respuesta, usando PostAsJsonAsync para enviar el payload como JSON
            var response = await _httpClient.PostAsJsonAsync("/api/generate", payload);

            // Verificamos si la respuesta de Ollama fue exitosa antes de intentar leer el json. Si no fue exitosa, respondemos con un error al cliente.
            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Error con Ollama");

            var json = await response.Content.ReadFromJsonAsync<JsonElement>();

            var texto = json.GetProperty("response").GetString();

            // --- LÓGICA DE BOTONES ---
                var opcionesBotones = new List<string>(); // Lista para almacenar las opciones de botones que se extraerán del contexto del inventario
                if (!string.IsNullOrEmpty(contextoInventario) && contextoInventario.Contains("Precio:"))
                {
                    opcionesBotones = contextoInventario
                        .Split('\n')
                        .Where(line => line.StartsWith("- "))
                        .Select(line => line.Replace("- ", "").Split('(')[0].Trim())
                        .ToList();
                }
            // --- FIN LÓGICA DE BOTONES ---

            // Respondemos al cliente con la respuesta generada por Ollama y las opciones de botones si las hay
            return Ok(new
            {
                texto,
                opciones = opcionesBotones
            });
                
        } // Fin del método POST

        // -- MÉTODO AUXILIAR PARA CONSULTAR EL INVENTARIO INTERNO --
        private async Task<string> ConsultarInventarioInterno(string tipoStr)
        {
            try 
            {
                // 1. Intentar convertir el string recibido al Enum 'TipoComponente'
                if (!Enum.TryParse(tipoStr, out TipoComponente tipoEnum))
                {
                    return "Categoría no reconocida.";
                }

                // 2. Realizar la consulta usando el valor del Enum directamente
                var componentes = await _context.Componentes
                    .AsNoTracking() // Mejora el rendimiento para consultas de solo lectura
                    .Where(c => c.Tipo == tipoEnum) 
                    .Take(5)
                    .Select(c => $"{c.Nombre} (Precio: ${c.Precio})")
                    .ToListAsync();
                
                // 3. Formatear la respuesta para que la IA la identifique claramente
                return string.Join("\n", componentes.Select(c => $"- {c}"));
            }
            catch(Exception ex)
            {
                // Log del error para que puedas verlo en la consola de depuración
                Console.WriteLine($"[ERROR BD]: {ex.Message}");
                return "Error técnico al acceder al catálogo.";
            }
        }
    } // Fin del controlador

    // DTO para recibir el mensaje del usuario
    public class ChatRequest
    {
        public required string Mensaje { get; set; }
    }
    
}
