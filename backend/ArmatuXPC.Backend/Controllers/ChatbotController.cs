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

            // 1. Detectar el componente "Ancla" (¿De qué pieza estamos hablando?)
            var componentesDetectados = await DetectarComponenteDesdeHistorial(request.Mensaje, request.Historial);
            var componenteAncla = componentesDetectados.FirstOrDefault();

            // 2. Detectar categoría y marca
            string? categoriaBuscada = DetectarCategoriaBuscada(mensajeUsuario);
            string? marcaBuscada = null;
            if (mensajeUsuario.ToLower().Contains("intel")) marcaBuscada = "Intel";
            if (mensajeUsuario.ToLower().Contains("amd")) marcaBuscada = "AMD";
            if (mensajeUsuario.ToLower().Contains("nvidia")) marcaBuscada = "NVIDIA";

            // 3. Construcción inteligente del Inventario (Filtrado por BD)
            // --- ORDEN DE PRIORIDAD CORREGIDO ---

            // A. Consulta general de stock/catálogo (Se mantiene igual)
            if (mensajeUsuario.Contains("stock") || mensajeUsuario.Contains("catálogo") || mensajeUsuario.Contains("catalogo")
            || mensajeUsuario.Contains("componentes") || mensajeUsuario.Contains("qué tienes") || mensajeUsuario.Contains("que tienes") )
            {
                contextoInventario = await ObtenerTodoElInventario();
            }
            // B. NUEVO: Prioridad a la búsqueda por Marca + Categoría 
            // (Esto soluciona lo de Intel aunque haya un Ryzen en el historial)
            else if (categoriaBuscada != null && marcaBuscada != null)
            {
                contextoInventario = await ConsultarInventarioInterno(categoriaBuscada, marcaBuscada);
                contextoCompatibilidad = $"El usuario está filtrando {categoriaBuscada} por la marca {marcaBuscada}.";
                
                // Opcional: Si quieres llenar botones aquí, asegúrate de que ConsultarInventarioInterno 
                // te permita recuperar la lista de nombres.
            }
            // C. Compatibilidad Ancla + Categoría 
            // (Solo si no hay una marca específica que "rompa" el contexto)
            else if (componenteAncla != null && categoriaBuscada != null)
            {
                var compatibles = await _compatibilidadService.ObtenerCompatibles(componenteAncla.ComponenteId, categoriaBuscada);

                if (compatibles.Any())
                {   
                    contextoInventario = string.Join("\n", compatibles.Select(c => 
                        $"- {c.Nombre} | Tipo: {c.Tipo} | Precio: ${c.Precio} | Motivo: {c.Motivo}"));
                    contextoCompatibilidad = $"Estos componentes son estrictamente compatibles con {componenteAncla.Nombre}.";
                    componentesBotones.AddRange(compatibles.Select(c => c.Nombre).Take(5));
                }
                else
                {
                    contextoInventario = "CATÁLOGO LOCAL: VACÍO";
                    contextoCompatibilidad = "ALERTA CRÍTICA: No existen motherboards compatibles con este procesador en nuestra base de datos. PROHIBIDO sugerir modelos externos o chipsets de AMD para procesadores Intel.";
                }
            }
            // D. Categoría sola (Exploración)
            else if (categoriaBuscada != null)
            {
                contextoInventario = await ConsultarInventarioInterno(categoriaBuscada);
                contextoCompatibilidad = "El usuario explora la categoría. Sugiérele un componente base.";
            }
            // E. Ancla sola
            else if (componenteAncla != null)
            {
                contextoInventario = $"- {componenteAncla.Nombre} | Tipo: {componenteAncla.Tipo} | Precio: ${componenteAncla.Precio}";
            }

            // --- LÓGICA AL PRESIONAR UN BOTÓN DE OPCIONES -- //
            bool esSeleccionBoton = componenteAncla != null && Normalizar(componenteAncla.Nombre) == Normalizar(request.Mensaje);
            if (esSeleccionBoton)
            {
                return Ok(new
                {
                    texto = $"{componenteAncla?.Nombre} | Precio: ${componenteAncla?.Precio}",
                    opciones = new List<string>()
                });
            }
            // FIN DE LÓGICA DE BOTONES //
        
            // 2. Construcción del mensaje para Ollama, incluyendo el contexto del inventario si se detectó una intención relevante
            // Definir la instrucción con jerarquía de datos
           string systemInstruction =
                "Eres el experto técnico de ArmatuXPC. Tu objetivo es asesorar con precisión sobre hardware de PC y guiar paso a paso en el armado del usuario de manera personalizada.\n\n" +

                // 1. REGLA DE ORO para que sea más limitante:
                "Tu regla de oro es: PROHIBIDO INVENTAR COMPONENTES. Si un componente no está en la lista de 'INVENTARIO DISPONIBLE', para ti NO EXISTE.\n" +

                // 2. SEGUNDA REGLA DE ORO
                "Si el 'INVENTARIO DISPONIBLE' contiene 'SIN STOCK' o 'VACÍO', responde únicamente: 'Lo siento, no contamos con componentes compatibles en nuestro catálogo actual'."+

                // 3. Modifica las REGLAS CRÍTICAS DE CONTROL (Elimina la opción de sugerir externos por defecto):
                "- SOBRE COMPONENTES EXTERNOS: PROHIBIDO sugerir componentes externos de forma proactiva. Solo si el usuario pregunta explícitamente '¿Qué me recomiendas que no tengas en stock?', puedes mencionar uno, advirtiendo que NO está en la tienda.\n" +
                "- RIGIDEZ DE LISTADO: Si en 'COMPATIBILIDADES REALES' solo hay 1 producto, muestra SOLO 1 recomendación. No intentes completar una lista de 3 o 4 opciones si no están en los datos proporcionados.\n" +

                // 4. Añade una instrucción de "Verdad de Fuente":
                "- COMPARACIÓN DE DATOS: Si el nombre de un componente en 'INVENTARIO DISPONIBLE' no tiene una regla que diga 'esCompatible: true' en 'COMPATIBILIDADES REALES' respecto al componente seleccionado, IGNÓRALO.\n" +

                "ORDEN DE PRIORIDAD PARA RESPONDER:\n" +
                "1. COMPATIBILIDAD TÉCNICA (SOCKET/CHIPSET): Antes de recomendar, verifica que el componente sea físicamente compatible (ej. No mezclar Intel LGA1700 con AMD AM5). Si no estás seguro, no lo afirmes.\n" +
                "2. INVENTARIO INTERNO: Recomienda SOLO productos que aparezcan en 'INVENTARIO DISPONIBLE'.\n" +
                "3. COMPATIBILIDADES REALES: Si esta sección contiene datos, úsalos como verdad absoluta para validar el inventario.\n\n" +

                "REGLAS CRÍTICAS DE CONTROL:\n" +
                "- SI HAY COMPONENTES EN EL INVENTARIO PERO NO SON COMPATIBLES: No los menciones. Di: 'Actualmente no tenemos stock en nuestro catálogo que sea compatible con ese componente'.\n" +
                "- SI NO HAY DATOS EN 'COMPATIBILIDADES REALES': No asumas compatibilidad por tu cuenta con productos del inventario. Limítate a decir que no hay compatibilidades registradas.\n" +

                "FORMATO DE RESPUESTA (OBLIGATORIO):\n" +
                "Para productos del catálogo:\n" +
                "Recomendación [Número]:\n- Nombre: [Nombre exacto]\n- Precio: [Precio]\n- Descripción: [Breve explicación técnica]\n\n" +
                
                "Para productos externos (Solo si es necesario):\n" +
                "Alternativa Externa (No disponible en stock):\n- Nombre:\n- Descripción: [Por qué es compatible]\n\n" +

                "CONTEXTO ACTUAL:\n" +
                "INVENTARIO DISPONIBLE:\n" + (string.IsNullOrEmpty(contextoInventario) ? "SIN STOCK" : contextoInventario) + "\n" +
                "COMPATIBILIDADES REALES:\n" + (string.IsNullOrEmpty(contextoCompatibilidad) ? "Sin datos de compatibilidad registrados." : contextoCompatibilidad);
                
            
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

            // Si el usuario pregunta por algo específico y detectamos que NO existe en absoluto
            // protección de envía a enviar a la IA y de recursos innecesarios
            if (string.IsNullOrEmpty(contextoInventario) && !string.IsNullOrEmpty(categoriaBuscada))
            {
                return Ok(new { 
                    texto = "Actualmente no cuento con ese componente en mi catálogo de ArmatuXPC.", 
                    opciones = new List<string>() 
                });
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

        // Método para consultar los componentes del inventario
        private async Task<string> ConsultarInventarioInterno(string tipoStr, string? marca = null)
        {
            try 
            {
                // 1. Convertir string a Enum
                if (!Enum.TryParse(tipoStr, true, out TipoComponente tipoEnum))
                {
                    return "Categoría no reconocida.";
                }

                // 2. Construir la Query
                var query = _context.Componentes
                    .AsNoTracking()
                    .Where(c => c.Tipo == tipoEnum && c.EstaActivo);

                // 3. Filtro por marca (Si el usuario dijo Intel, AMD, etc.)
                if (!string.IsNullOrEmpty(marca))
                {
                    // Usamos ILike para que no importe si escriben "intel" o "INTEL"
                    query = query.Where(c => EF.Functions.ILike(c.Nombre, $"%{marca}%"));
                }

                var componentes = await query
                    .OrderBy(c => c.Nombre)
                    .Take(10) // Subimos a 10 para dar más variedad si hay stock
                    .Select(c => $"- {c.Nombre} (Precio: ${c.Precio})")
                    .ToListAsync();
                
                if (!componentes.Any())
                {
                    return string.IsNullOrEmpty(marca) 
                        ? "No hay stock disponible en esta categoría." 
                        : $"No hay stock disponible de {marca} en esta categoría.";
                }

                return string.Join("\n", componentes);
            }
            catch(Exception ex)
            {
                Console.WriteLine($"[ERROR BD]: {ex.Message}");
                return "Error técnico al acceder al catálogo.";
            }
        }

        // Método auxiliar para detección inteligente de categorías de componentes
        private string? DetectarCategoriaBuscada(string mensaje)
        {
            // Validaciones de categorías en los componentes
            if (mensaje.Contains("placa") || mensaje.Contains("motherboard") || mensaje.Contains("tarjeta madre"))
                return "PlacaBase";
            if (mensaje.Contains("procesador") || mensaje.Contains("cpu"))
                return "CPU";
            if (mensaje.Contains("memoria ram") || mensaje.Contains("ram"))
                return "MemoriaRAM";
            if (mensaje.Contains("tarjeta gráfica") || mensaje.Contains("gpu") || mensaje.Contains("video"))
                return "GPU";
            if (mensaje.Contains("disco") || mensaje.Contains("ssd") || mensaje.Contains("hdd") || mensaje.Contains("almacenamiento"))
                return "Almacenamiento";
            if (mensaje.Contains("fuente") || mensaje.Contains("psu") || mensaje.Contains("poder"))
                return "FuentePoder";
            if (mensaje.Contains("refrigeración") || mensaje.Contains("cooler") || mensaje.Contains("ventilador") || mensaje.Contains("disipador"))
                return "Refrigeracion";
            if (mensaje.Contains("caja") || mensaje.Contains("gabinete") || mensaje.Contains("case"))
                return "Gabinete";

            return null;
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
    
    } // Fin ChatbotController
}
