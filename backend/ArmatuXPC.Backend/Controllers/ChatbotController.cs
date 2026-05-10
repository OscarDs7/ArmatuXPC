using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Text;
using System.Text.Json;
using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Models;
using ArmatuXPC.Backend.Services;
using System.Linq;

namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/chatbot")]
    public class ChatbotController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly AppDbContext _context;
        private readonly CompatibilidadService _compatibilidadService;


        public ChatbotController(IHttpClientFactory httpClientFactory, AppDbContext context, CompatibilidadService compatibilidadService)
        {
            _context = context;
            _compatibilidadService = compatibilidadService;
            _httpClient = httpClientFactory.CreateClient("OllamaClient");
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            // Variables necesarias para el mensaje de usuario y el contexto del stock del negocio
            string mensajeUsuario = request.Mensaje.ToLower(); // Convertimos a minúsculas para facilitar la detección de palabras clave
            string contextoInventario = ""; // Aquí construiremos un resumen del stock relevante para el mensaje del usuario
            string contextoCompatibilidad = ""; // Aquí construiremos un resumen de compatibilidad relevante para el mensaje del usuario
            var componentesBotones = new List<string>(); // Lista para almacenar los nombres de los componentes que se mostrarán como opciones de botones en el frontend, extraídos del contexto del inventario

            // --- LÓGICA DE DETECCIÓN DE INTENCIÓN Y CONSTRUCCIÓN DE CONTEXTO ---

            // 0. Detección de intención general para consultar el inventario completo (si el usuario menciona palabras clave relacionadas con stock o catálogo) o para consultar categorías específicas (CPU, RAM, GPU, etc.)
            if (
                mensajeUsuario.Contains("stock") ||
                mensajeUsuario.Contains("inventario") ||
                mensajeUsuario.Contains("catálogo") ||
                mensajeUsuario.Contains("catalogo") ||
                mensajeUsuario.Contains("componentes") ||
                mensajeUsuario.Contains("qué tienes") ||
                mensajeUsuario.Contains("que tienes")
            )
            {
                contextoInventario = await ObtenerTodoElInventario();
            }

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

            //  Buscar si el usuario mencionó un componente exacto
           string mensajeNormalizado = mensajeUsuario
                .ToLower()
                .Replace("-", " ")
                .Trim();

            var componentesDetectados =
                await DetectarComponenteDesdeHistorial(
                    request.Mensaje,
                    request.Historial);


            // --- LÓGICA AL PRESIONAR UN BOTÓN DE OPCIONES -- //
            bool esSeleccionBoton = false;
            if (componentesDetectados.Any())
            {
                esSeleccionBoton =
                    componentesDetectados.Any(c =>
                        Normalizar(c.Nombre) ==
                        Normalizar(request.Mensaje));
            }

            if (esSeleccionBoton)
            {
                var componente = componentesDetectados.First();

                return Ok(new
                {
                    texto =
                        $"{componente.Nombre} | Precio: ${componente.Precio}",
                    opciones = new List<string>()
                });
            }
            // FIN DE LÓGICA //

            // Si se detectó un componente específico, consultamos su compatibilidad para enriquecer el contexto
            if (componentesDetectados.Any())
            {
                contextoCompatibilidad = "";
                componentesBotones.Clear();

                contextoInventario =
                    string.Join("\n",
                        componentesDetectados.Select(c =>
                            $"- {c.Nombre} | Tipo: {c.Tipo} | Precio: ${c.Precio}"
                        ));

                string? tipoDestino = null;

                if (mensajeUsuario.Contains("placa") ||
                    mensajeUsuario.Contains("motherboard") ||
                    mensajeUsuario.Contains("tarjeta madre"))
                {
                    tipoDestino = "PlacaBase";
                }
                else if (mensajeUsuario.Contains("ram"))
                {
                    tipoDestino = "MemoriaRAM";
                }
                else if (mensajeUsuario.Contains("gpu"))
                {
                    tipoDestino = "GPU";
                }
                else if (mensajeUsuario.Contains("cpu") ||
                        mensajeUsuario.Contains("procesador"))
                {
                    tipoDestino = "CPU";
                }
                else if (mensajeUsuario.Contains("disco") ||
                        mensajeUsuario.Contains("ssd") ||
                        mensajeUsuario.Contains("hdd"))
                {
                    tipoDestino = "Almacenamiento";
                }
                else if (mensajeUsuario.Contains("fuente") ||
                        mensajeUsuario.Contains("psu"))
                {
                    tipoDestino = "FuentePoder";
                }
                else if (mensajeUsuario.Contains("cooler") ||
                        mensajeUsuario.Contains("refrigeración"))
                {
                    tipoDestino = "Refrigeracion";
                }
                else if (mensajeUsuario.Contains("gabinete") ||
                        mensajeUsuario.Contains("case"))
                {
                    tipoDestino = "Gabinete";
                }

                if (tipoDestino != null)
                {
                    foreach (var componenteDetectado in componentesDetectados)
                    {
                        var compatibles =
                            await _compatibilidadService.ObtenerCompatibles(
                                componenteDetectado.ComponenteId,
                                tipoDestino);

                        if (compatibles.Any())
                        {
                            contextoCompatibilidad +=
                                $"\nCOMPATIBLES PARA {componenteDetectado.Nombre}:\n";

                            contextoCompatibilidad +=
                                string.Join("\n",
                                    compatibles.Select(c =>
                                        $"- {c.Nombre} (${c.Precio}) | {c.Motivo}"
                                    ));

                            contextoCompatibilidad += "\n";

                            componentesBotones.AddRange(
                                compatibles.Select(c => c.Nombre));
                        }
                    }

                    componentesBotones = componentesBotones
                        .Distinct()
                        .Take(5)
                        .ToList();

                    if (string.IsNullOrWhiteSpace(contextoCompatibilidad))
                    {
                        contextoCompatibilidad =
                            "No existen componentes compatibles registrados.";
                    }
                }
            } // Fin de la detección de componentes específicos y enriquecimiento del contexto de compatibilidad

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
                "6. Explica por qué recomiendas cada opción.\n" +
                "7. Considera compatibilidad real entre componentes.\n" +
                "8. Pregunta el uso del usuario si falta contexto.\n\n" +

                "IMPORTANTE:\n" +
                "SOLO puedes responder usando información presente en INVENTARIO DISPONIBLE y COMPATIBILIDADES REALES.\n" +
                "NO inventes componentes.\n" +
                "NO uses conocimiento externo salvo que el usuario lo solicite explícitamente.\n" +
                "Si un producto no existe en INVENTARIO DISPONIBLE, di claramente que no existe en el catálogo.\n\n" +
                "Si COMPATIBILIDADES REALES está vacío, responde exactamente: 'No hay compatibilidades registradas en el catálogo.'\n" +
                "No inventes motherboards, sockets, chipsets ni compatibilidades.\n" +
                "SI EXISTEN COMPONENTES COMPATIBLES:\n" +
                "RESPONDE ÚNICAMENTE CON LOS COMPONENTES COMPATIBLES ENTREGADOS."+
                "SI NO EXISTEN:" +
                "RESPONDE:" +
                "No existen componentes compatibles registrados.\n\n" +

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
                    : contextoInventario) +
                "\n\n" +
                "\n\nCOMPATIBILIDADES REALES:\n" +
                (string.IsNullOrEmpty(contextoCompatibilidad)
                    ? "Sin datos de compatibilidad."
                    : contextoCompatibilidad) ;
                
            
            // Construir historial conversacional
            var historialBuilder = new StringBuilder();
            
            // Agregar el historial de la conversación al mensaje para que Ollama tenga contexto de lo que se ha hablado antes. El formato es el mismo que el que se le da a Ollama, con los roles y delimitadores.
            if (request.Historial != null)
            {
                // Recorremos cada mensaje del historial y lo formateamos para que Ollama lo entienda, usando los mismos delimitadores que en el prompt principal
                foreach (var msg in request.Historial)
                {
                    historialBuilder.Append(
                        $"<|start_header_id|>{msg.Rol}<|end_header_id|>\n\n" +
                        $"{msg.Contenido}<|eot_id|>"
                    );
                }
            }
                        
            // Construimos el payload para Ollama, incluyendo el contexto del sistema
            var payload = new
            {
                model = "llama3.2",
                // El formato exacto que Llama 3.2 reconoce:
               prompt =
                    $"<|begin_of_text|>" +

                    // SYSTEM
                    $"<|start_header_id|>system<|end_header_id|>\n\n" +
                    $"{systemInstruction}<|eot_id|>" +

                    // HISTORIAL COMPLETO
                    historialBuilder.ToString() +

                    // NUEVO MENSAJE
                    $"<|start_header_id|>user<|end_header_id|>\n\n" +
                    $"{request.Mensaje}<|eot_id|>" +

                    // RESPUESTA DEL ASSISTANT
                    $"<|start_header_id|>assistant<|end_header_id|>\n\n",
                options = new { temperature = 0.05, num_predict = 400, top_p = 0.9, stop = new[] { "<|eot_id|>", "<|start_header_id|>" } },
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
            var opcionesBotones = componentesBotones;

            // Respondemos al cliente con la respuesta generada por Ollama y las opciones de botones si las hay
            return Ok(new
            {
                texto,
                opciones = opcionesBotones
            });
                
        } // Fin del método POST
        
        // -- MÉTODOS AUXILIARES PARA CONSULTAR EL INVENTARIO INTERNO --

        private async Task<string> ObtenerTodoElInventario()
        {
            try
            {
                var componentes = await _context.Componentes
                    .AsNoTracking()
                    .Where(c => c.EstaActivo)
                    .ToListAsync();

                if (!componentes.Any())
                    return "No hay componentes registrados.";

                return string.Join("\n", componentes.Select(c =>
                    $"- {c.Nombre} | Tipo: {c.Tipo} | Precio: ${c.Precio}"
                ));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR INVENTARIO]: {ex.Message}");
                return "Error al consultar inventario.";
            }
        }
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

        // -- MÉTODOS AUXILIARES PARA DETECCIÓN DE COMPONENTES EN EL MENSAJE --

        // Este método normaliza un texto para facilitar la comparación, eliminando caracteres especiales, convirtiendo a minúsculas y reduciendo espacios. Esto ayuda a que la detección de componentes sea más flexible y no dependa de que el usuario escriba exactamente el nombre del componente.
        private string Normalizar(string texto)
        {
            return texto
                .ToLower()
                .Replace("-", " ")
                .Replace("_", " ")
                .Replace(",", "")
                .Replace(".", "")
                .Replace("(", "")
                .Replace(")", "")
                .Replace("  ", " ")
                .Trim();
        }

        // Este método busca de forma flexible un componente en la lista, permitiendo coincidencias parciales y sin necesidad de que el usuario escriba el nombre exacto. Se puede mejorar con técnicas más avanzadas como similitud de texto o NLP, pero esta es una versión básica que puede funcionar para nombres de componentes que suelen tener palabras clave comunes.
        private List<Componente> BuscarComponenteFlexible(
            List<Componente> componentes,
            string textoUsuario)
        {
            var texto = Normalizar(textoUsuario);

            var resultados = new List<Componente>();

            foreach (var componente in componentes)
            {
                var nombre = Normalizar(componente.Nombre);

                var palabrasNombre = nombre.Split(' ');

                int coincidencias =
                    palabrasNombre.Count(p =>
                        texto.Contains(p));

                // Match fuerte
                if (coincidencias >= 2)
                {
                    resultados.Add(componente);
                    continue;
                }

                // Match modelo
                if (texto.Contains(
                    Normalizar(componente.Modelo)))
                {
                    resultados.Add(componente);
                    continue;
                }

                // Match nombre completo
                if (texto.Contains(nombre))
                {
                    resultados.Add(componente);
                }
            }

            return resultados
                .DistinctBy(c => c.ComponenteId)
                .ToList();
        }

        // Este método intenta detectar un componente específico mencionado por el usuario, buscando tanto en el mensaje actual como en el historial de la conversación. Esto es útil para mantener el contexto y entender a qué componente se refiere el usuario incluso si no lo menciona explícitamente en cada mensaje.
        private async Task<List<Componente>> DetectarComponenteDesdeHistorial(
            string mensajeActual,
            List<MensajeChat>? historial)
        {
            var componentes = await _context.Componentes
                .AsNoTracking()
                .ToListAsync();

            // Buscar en mensaje actual
            var encontrados =
                BuscarComponenteFlexible(componentes, mensajeActual);

            if (encontrados.Any())
                return encontrados;

            // Buscar en historial
            if (historial != null)
            {
                foreach (var msg in historial.AsEnumerable().Reverse())
                {
                    encontrados =
                        BuscarComponenteFlexible(
                            componentes,
                            msg.Contenido);

                    if (encontrados.Any())
                        return encontrados;
                }
            }

            return new List<Componente>();
        }

        private async Task<Componente?> DetectarUltimoComponentePorTipo(
            List<MensajeChat>? historial,
            string tipo)
        {
            if (historial == null)
                return null;

            var componentes = await _context.Componentes
                .AsNoTracking()
                .ToListAsync();

            foreach (var msg in historial.AsEnumerable().Reverse())
            {
                var encontrados =
                    BuscarComponenteFlexible(
                        componentes,
                        msg.Contenido);

                var encontrado =
                    encontrados.FirstOrDefault(c =>
                        c.Tipo.ToString()
                        .Equals(tipo,
                            StringComparison.OrdinalIgnoreCase));

                if (encontrado != null)
                {
                    return encontrado;
                }
            }

            return null;
        }

    } // Fin del controlador

    // DTO para recibir el mensaje del usuario
    public class ChatRequest
    {
        public required string Mensaje { get; set; } // El mensaje que el usuario envía al chatbot

        public List<MensajeChat>? Historial { get; set; }

    }
    // DTO para representar cada mensaje en el historial de la conversación, con su rol (usuario o asistente) y su contenido
    public class MensajeChat
    {
        public string Rol { get; set; } = "";
        public string Contenido { get; set; } = "";
    }
    
}
