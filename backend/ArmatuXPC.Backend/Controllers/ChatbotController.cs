using Microsoft.AspNetCore.Mvc;
using System.Text;
using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Models;
using ArmatuXPC.Backend.Services;

namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/chatbot")]
    public class ChatbotController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly CompatibilidadService _compatibilidadService;
        private readonly OllamaService _ollamaService;


        public ChatbotController(AppDbContext context, CompatibilidadService compatibilidadService, OllamaService ollamaService)
        {
            _context = context;
            _compatibilidadService = compatibilidadService;
            _ollamaService = ollamaService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
            try
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

                string resultadoCompatibilidad = "";

                // A. Detectar intención de compatibilidad
                bool esDudaCompatibilidad = mensajeUsuario.Contains("compatible") || 
                                            mensajeUsuario.Contains("queda") || 
                                            mensajeUsuario.Contains("sirve") || 
                                            mensajeUsuario.Contains("puedo poner");

                // 2. Si hay duda de compatibilidad, cargamos los datos técnicos clave
                if (esDudaCompatibilidad || componentesDetectados.Count > 1)
                {

                    if (componentesDetectados.Count >= 2)
                    {
                        var cpu = componentesDetectados
                            .FirstOrDefault(c => c.Tipo == TipoComponente.CPU);

                        var motherboard = componentesDetectados
                            .FirstOrDefault(c => c.Tipo == TipoComponente.PlacaBase);

                        if(cpu != null && motherboard != null)
                        {
                            bool compatibles =
                                cpu.Socket == motherboard.Socket;

                            resultadoCompatibilidad =
                                compatibles
                                ? $"RESULTADO REAL: COMPATIBLES porque ambos usan socket {cpu.Socket}."
                                : $"RESULTADO REAL: INCOMPATIBLES porque CPU usa {cpu.Socket} y motherboard usa {motherboard.Socket}.";
                        }
                    }

                    // Cargamos los tipos que requieren validación de Socket y RAM
                    var tiposCriticos = new List<TipoComponente> { 
                        TipoComponente.CPU, 
                        TipoComponente.PlacaBase, 
                        TipoComponente.MemoriaRAM 
                    };
                    
                    var componentesTecnicos = await _context.Componentes
                        .AsNoTracking()
                        .Where(c => c.EstaActivo && tiposCriticos.Contains(c.Tipo))
                        .Take(20)
                        .ToListAsync();

                    // Construimos el string con los campos que Ollama debe comparar
                    contextoInventario = string.Join("\n", componentesTecnicos.Select(c => 
                        $"- {c.Nombre} | {c.Tipo} | Skt:{c.Socket ?? "N/A"} | RAM:{c.TipoMemoria ?? "N/A"}"));                    
                    contextoCompatibilidad = "REGLA DE ORO: Si Socket de CPU == Socket de Placa, SON COMPATIBLES. Si Memoria de RAM == Memoria de Placa, SON COMPATIBLES. El Ryzen 5000 es AM4 y usa DDR4.";
                }
                
                // B. Consulta general de stock/catálogo (Se mantiene igual)
                else if (mensajeUsuario.Contains("stock") || mensajeUsuario.Contains("catálogo") || mensajeUsuario.Contains("catalogo"))
                {
                    contextoInventario = await ObtenerTodoElInventario();
                }
                
                // C. Búsqueda por Marca + Categoría 
                else if (categoriaBuscada != null && marcaBuscada != null)
                {
                    contextoInventario = await ConsultarInventarioInterno(categoriaBuscada, marcaBuscada);
                }

                // D. Compatibilidad Ancla + Categoría 
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

                // E. Categoría sola (Exploración)
                else if (categoriaBuscada != null)
                {
                    contextoInventario = await ConsultarInventarioInterno(categoriaBuscada);
                    contextoCompatibilidad = "El usuario explora la categoría. Sugiérele un componente base.";
                }

                // F. Ancla sola
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
                string systemInstruction =
                    "Eres el experto técnico de ArmatuXPC.\n\n" +

                    "REGLAS:\n" +
                    "- Solo usa componentes del INVENTARIO.\n" +
                    "- No inventes productos.\n" +
                    "- CPU y motherboard deben compartir socket.\n" +
                    "- RAM y motherboard deben compartir tipo DDR.\n" +
                    "- Si no hay stock, dilo claramente.\n\n" +

                    "RESPUESTA:\n" +
                    "- Explica breve y técnicamente.\n" +
                    "- Sé directo.\n" +
                    "- No respondas temas no técnicos.\n\n" +

                    "CONTEXTO:\n" +
                    "INVENTARIO:\n" +
                    contextoInventario + "\n\n" +

                    "NOTAS:\n" +
                    contextoCompatibilidad + "\n\n" +

                    resultadoCompatibilidad;

                // Construir historial conversacional
                var historialBuilder = new StringBuilder();

                // Limitar historial a 6 mensajes a recordar de la conversación
                var historialReciente =
                    request.Historial?
                        .TakeLast(6)
                        .ToList();
                
                // Agregar el historial de la conversación al mensaje para que Ollama tenga contexto de lo que se ha hablado antes. El formato es el mismo que el que se le da a Ollama, con los roles y delimitadores.
                if (historialReciente != null)
                {
                    // Recorremos cada mensaje del historial y lo formateamos para que Ollama lo entienda, usando los mismos delimitadores que en el prompt principal
                    foreach (var msg in historialReciente)
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
                            
            // Prompt al modelo ya limpio
            string prompt =
                    $"<|begin_of_text|>" +

                    $"<|start_header_id|>system<|end_header_id|>\n\n" +
                    $"{systemInstruction}<|eot_id|>" +

                    historialBuilder.ToString() +

                    $"<|start_header_id|>user<|end_header_id|>\n\n" +
                    $"{request.Mensaje}<|eot_id|>" +

                    $"<|start_header_id|>assistant<|end_header_id|>\n\n";

                var texto =
                    await _ollamaService
                        .GenerarRespuesta(prompt);
                
                // Enviamos la solicitud a Ollama para generar la respuesta, usando PostAsJsonAsync para enviar el payload como JSON

                // --- LÓGICA DE BOTONES ---
                var opcionesBotones = componentesBotones;

                // Respondemos al cliente con la respuesta generada por Ollama y las opciones de botones si las hay
                return Ok(new
                {
                    texto,
                    opciones = opcionesBotones
                });
                
            }
            catch(Exception ex)
            {
                return StatusCode(500, new
                {
                    error = ex.Message
                });
            }

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
                   $"- {c.Nombre} | Tipo: {c.Tipo} | Precio: ${c.Precio} | Socket: {c.Socket ?? "N/A"} | RAM: {c.TipoMemoria ?? "N/A"} | Watts: {c.ConsumoWatts ?? 0}W"
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
            if (!Enum.TryParse(tipoStr, true, out TipoComponente tipoEnum)) return "Categoría no reconocida.";

            var query = _context.Componentes
                .AsNoTracking()
                .Where(c => c.Tipo == tipoEnum && c.EstaActivo);

            if (!string.IsNullOrEmpty(marca))
                query = query.Where(c => EF.Functions.ILike(c.Nombre, $"%{marca}%"));

            var componentes = await query
                .OrderBy(c => c.Nombre)
                .Take(10)
                .Select(c => $"- {c.Nombre} | Socket: {c.Socket ?? "N/A"} | RAM: {c.TipoMemoria ?? "N/A"} | Precio: ${c.Precio}")
                .ToListAsync();

            return componentes.Any() ? string.Join("\n", componentes) : "SIN STOCK";
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

            // Lista de palabras para detener
            var stopWords = new[]
            {
                "pro",
                "gaming",
                "plus",
                "ultra",
                "elite",
                "max"
            };

            var resultados = new List<Componente>();

            foreach (var componente in componentes)
            {
                var nombre = Normalizar(componente.Nombre);

                var palabrasNombre = nombre
                    .Split(' ')
                    .Where(p => !stopWords.Contains(p))
                    .ToList();

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
