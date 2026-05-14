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
        private readonly BuildCompatibilityService _buildCompatibilityService;


        public ChatbotController(
            AppDbContext context,
            CompatibilidadService compatibilidadService,
            OllamaService ollamaService,
            BuildCompatibilityService buildCompatibilityService)
        {
            _context = context;
            _compatibilidadService = compatibilidadService;
            _ollamaService = ollamaService;
            _buildCompatibilityService = buildCompatibilityService;
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

                // 1. Obtener todos los componentes activos
                var todosLosComponentes = await _context.Componentes
                    .AsNoTracking()
                    .Where(c => c.EstaActivo)
                    .ToListAsync();

                // 2. Buscar primero en el mensaje ACTUAL
                var componentesMensajeActual =
                    BuscarComponenteFlexible(
                        todosLosComponentes,
                        request.Mensaje);

                // 3. Buscar en historial SOLO si no encontró nada
                var componentesHistorial =
                    await DetectarComponenteDesdeHistorial(
                        request.Mensaje,
                        request.Historial);

                // 4. Prioridad:
                // mensaje actual > historial
                var componentesDetectados =
                    componentesMensajeActual.Any()
                    ? componentesMensajeActual
                    : componentesHistorial;

                // 5. Componente ancla
                var componenteAncla =
                    componentesDetectados.FirstOrDefault();

                // 2. Detectar categoría, marca y tipo de socket del componente
                string? categoriaBuscada =
                    DetectarCategoriaDesdeHistorial(
                        request.Mensaje,
                        request.Historial);
                string? marcaBuscada = null;
                if (mensajeUsuario.ToLower().Contains("intel")) marcaBuscada = "Intel";
                if (mensajeUsuario.ToLower().Contains("amd")) marcaBuscada = "AMD";
                if (mensajeUsuario.ToLower().Contains("nvidia")) marcaBuscada = "NVIDIA";

                // Detectar socket
                string? socketBuscado = null;

                var socketsValidos = new[]
                {   
                    "AM4",
                    "AM5",
                    "LGA1700",
                    "LGA1851"
                };

                foreach (var socket in socketsValidos)
                {
                    if (mensajeUsuario.ToUpper().Contains(socket))
                    {
                        socketBuscado = socket;
                        break;
                    }
                }

                // Detectar tipo de RAM
                string? ramBuscada = null;

                var tiposRamValidos = new[]
                {
                    "DDR4",
                    "DDR5"
                };

                foreach (var ram in tiposRamValidos)
                {
                    if (mensajeUsuario.ToUpper().Contains(ram))
                    {
                        ramBuscada = ram;
                        break;
                    }
                }

                // 3. Construcción inteligente del Inventario (Filtrado por BD)
                // --- ORDEN DE PRIORIDAD CORREGIDO ---

                string resultadoCompatibilidad = "";

                // A. Detectar intención de compatibilidad
                bool esDudaCompatibilidad =
                    mensajeUsuario.Contains("compatible") ||
                    mensajeUsuario.Contains("compatibilidad") ||
                    mensajeUsuario.Contains("sirve") ||
                    mensajeUsuario.Contains("queda") ||
                    mensajeUsuario.Contains("puedo poner") ||
                    mensajeUsuario.Contains("funciona con") ||
                    mensajeUsuario.Contains("soporta") ||
                    mensajeUsuario.Contains("combinar") ||
                    mensajeUsuario.Contains("usar con") || 
                    mensajeUsuario.Contains("combina") || 
                    mensajeUsuario.Contains("funciona") || 
                    mensajeUsuario.Contains("va con");
                
                // B. Detectar intención de educación
                bool esPreguntaEducativa =
                    mensajeUsuario.Contains("que es") ||
                    mensajeUsuario.Contains("qué es") ||
                    mensajeUsuario.Contains("para que sirve") ||
                    mensajeUsuario.Contains("cómo funciona");
                
                // Listas de componentes compatible 
                List<Componente> cpusCompatibles = new();
                List<Componente> ramCompatibles = new();

                // 4. Compatibilidad Avanzada
                // Si hay duda de compatibilidad, cargamos los datos técnicos clave
                if ( esDudaCompatibilidad)
                {
                        var cpu = componentesDetectados
                            .FirstOrDefault(c => c.Tipo == TipoComponente.CPU);

                        var motherboard = componentesDetectados
                            .FirstOrDefault(    c => c.Tipo == TipoComponente.PlacaBase);
                        
                        var ram = componentesDetectados
                            .FirstOrDefault(c => c.Tipo == TipoComponente.MemoriaRAM);

                        // NUEVO SISTEMA DE BUILD con nuevo modelo y servicio creado
                        var build = new BuildPC
                        {
                            CPU = cpu,
                            Motherboard = motherboard,
                            RAM = ram
                        };

                        var errores =
                            _buildCompatibilityService
                                .ValidarBuild(build);

                        // Si hay errores de compatibilidad
                        if (errores.Any())
                        {
                            return Ok(new
                            {
                                texto =
                                    "Encontré problemas de compatibilidad:\n\n" +
                                    string.Join("\n", errores),

                                opciones = new List<string>()
                            });
                        }

                        // Validación de compatibilidad correcta
                        if (
                                cpu != null &&
                                motherboard != null &&
                                mensajeUsuario.Contains("compatible")

                            )
                            {
                                return Ok(new
                                {
                                    texto =
                                        $"Sí, el {cpu.Nombre} es compatible con la {motherboard.Nombre} porque ambos utilizan socket {cpu.Socket}.",

                                    opciones = new List<string>()
                                });
                            }

                       // --- CPU Compatible --- //
                        if (
                            motherboard != null &&
                            (
                                mensajeUsuario.Contains("cpu") ||
                                mensajeUsuario.Contains("procesador")
                            )
                        )
                        {
                            cpusCompatibles =
                                _buildCompatibilityService
                                    .FiltrarCompatibles(
                                        motherboard,
                                        todosLosComponentes)
                                    .Where(c => c.Tipo == TipoComponente.CPU)
                                    .Take(5)
                                    .ToList();

                            if (cpusCompatibles.Any())
                            {
                                return Ok(new
                                {
                                    texto =
                                        $"La motherboard {motherboard.Nombre} utiliza socket {motherboard.Socket}.\n\n" +

                                        "CPUs compatibles disponibles:\n\n" +

                                        string.Join("\n",
                                            cpusCompatibles.Select(c =>
                                                $"- {c.Nombre} | Socket: {c.Socket} | Precio: ${c.Precio}"
                                            )
                                        ),

                                    opciones = cpusCompatibles
                                        .Select(c => c.Nombre)
                                        .Take(5)
                                        .ToList()
                                });
                            }
                        }

                        // --- Compatibilidad CPU + Motherboard --- //
                        if(cpu != null && motherboard != null)
                        {
                                ramCompatibles =
                                        _buildCompatibilityService
                                        .FiltrarCompatibles(
                                            motherboard,
                                            todosLosComponentes)
                                        .Where(c => c.Tipo == TipoComponente.MemoriaRAM)
                                        .Take(5)
                                        .ToList();

                            bool compatibles =
                                _buildCompatibilityService
                                .CPUCompatibleMotherboard(cpu, motherboard);

                            resultadoCompatibilidad +=
                                compatibles
                                ? $"RESULTADO REAL: COMPATIBLES porque ambos usan socket {cpu.Socket}."
                                : $"RESULTADO REAL: INCOMPATIBLES porque CPU usa {cpu.Socket} y motherboard usa {motherboard.Socket}.";
                            
                            if (ramCompatibles.Any())
                            {
                                resultadoCompatibilidad +=
                                    "\nRAM COMPATIBLES:\n" +

                                    string.Join("\n",
                                        ramCompatibles.Select(r =>
                                            $"- {r.Nombre} ({r.TipoMemoria})"));
                            }
                        }

                        // --- RAM Compatible --- //
                        if (
                            motherboard != null &&
                            (
                                mensajeUsuario.Contains("ram") ||
                                mensajeUsuario.Contains("memoria")
                            )
                        )
                        {
                            ramCompatibles =
                                _buildCompatibilityService
                                    .FiltrarCompatibles(
                                        motherboard,
                                        todosLosComponentes)
                                    .Where(c => c.Tipo == TipoComponente.MemoriaRAM)
                                    .Take(5)
                                    .ToList();

                            if (ramCompatibles.Any())
                            {
                                return Ok(new
                                {
                                    texto =
                                        $"La motherboard {motherboard.Nombre} utiliza memoria {motherboard.TipoMemoria}.\n\n" +

                                        "RAM compatibles disponibles:\n\n" +

                                        string.Join("\n",
                                            ramCompatibles.Select(r =>
                                                $"- {r.Nombre} | Tipo: {r.TipoMemoria} | Precio: ${r.Precio}"
                                            )
                                        ),

                                    opciones = ramCompatibles
                                        .Select(r => r.Nombre)
                                        .Take(5)
                                        .ToList()
                                });
                            }
                        }

                        // --- Motherboards compatibles con RAM --- //
                        if (
                            ram != null &&
                            (
                                mensajeUsuario.Contains("motherboard") ||
                                mensajeUsuario.Contains("placa") ||
                                mensajeUsuario.Contains("tarjeta madre")
                            )
                        )
                        {
                            var motherboardsCompatibles =
                                _buildCompatibilityService
                                    .FiltrarCompatibles(
                                        ram,
                                       todosLosComponentes)
                                    .Where(c => c.Tipo == TipoComponente.PlacaBase)
                                    .Take(5)
                                    .ToList();

                            if (motherboardsCompatibles.Any())
                            {
                                return Ok(new
                                {
                                    texto =
                                        $"La RAM {ram.Nombre} utiliza memoria {ram.TipoMemoria}.\n\n" +

                                        "Motherboards compatibles disponibles:\n\n" +

                                        string.Join("\n",
                                            motherboardsCompatibles.Select(m =>
                                                $"- {m.Nombre} | Socket: {m.Socket} | RAM: {m.TipoMemoria} | Precio: ${m.Precio}"
                                            )
                                        ),

                                    opciones = motherboardsCompatibles
                                        .Select(m => m.Nombre)
                                        .Take(5)
                                        .ToList()
                                });
                            }
                        }

                        // --- Motherboards compatibles con CPU --- //
                        if (
                            cpu != null &&
                            (
                                mensajeUsuario.Contains("motherboard") ||
                                mensajeUsuario.Contains("placa")
                            )
                        )
                        {
                           var motherboardsCompatibles =
                                _buildCompatibilityService
                                    .FiltrarCompatibles(
                                        cpu,
                                        todosLosComponentes)
                                    .Where(c => c.Tipo == TipoComponente.PlacaBase)
                                    .Take(5)
                                    .ToList();

                            if (motherboardsCompatibles.Any())
                            {
                                return Ok(new
                                {
                                    texto =
                                        $"El procesador {cpu.Nombre} utiliza socket {cpu.Socket}.\n\n" +

                                        "Motherboards compatibles disponibles:\n\n" +

                                        string.Join("\n",
                                            motherboardsCompatibles.Select(m =>
                                                $"- {m.Nombre} | Socket: {m.Socket} | RAM: {m.TipoMemoria} | Precio: ${m.Precio}"
                                            )
                                        ),

                                    opciones = motherboardsCompatibles
                                        .Select(m => m.Nombre)
                                        .Take(5)
                                        .ToList()
                                });
                            }
                        }


                    // Si hay componentes técnicos detectados
                    var componentesTecnicos = componentesDetectados;

                    // Si no hay componentes 
                    if(!componentesTecnicos.Any())
                    {
                        componentesTecnicos = await _context.Componentes 
                            .AsNoTracking() 
                            .Where(c =>
                                c.EstaActivo && 
                                ( 
                                    c.Tipo == TipoComponente.CPU || 
                                    c.Tipo == TipoComponente.PlacaBase ||
                                    c.Tipo == TipoComponente.MemoriaRAM
                                )) 
                            .Take(20) 
                            .ToListAsync();
                    }

                    // Construimos el string con los campos que Ollama debe comparar
                    contextoInventario = string.Join("\n",
                         componentesTecnicos.Select(c => 
                         {
                             if (c.Tipo == TipoComponente.MemoriaRAM) 
                             { 
                                return $"- {c.Nombre} | RAM:{c.TipoMemoria}"; 
                             } 
                             if (c.Tipo == TipoComponente.CPU) 
                             { 
                                return $"- {c.Nombre} | CPU | Socket:{c.Socket}"; 
                             } 
                             if (c.Tipo == TipoComponente.PlacaBase) 
                             { 
                                return $"- {c.Nombre} | PlacaBase | Socket:{c.Socket} | RAM:{c.TipoMemoria}"; 
                             } 
                             
                             return $"- {c.Nombre}"; 
                        })); 
                    
                    contextoCompatibilidad = 
                        "REGLA DE ORO: Si Socket de CPU == Socket de Placa, SON COMPATIBLES. " + 
                        "Si Memoria RAM == Memoria de Placa, SON COMPATIBLES." + 
                        "Esta REGLA DE ORO Tú lo sabes pero no se lo digas al usuario, sólo úsalo a tu favor";

                        contextoCompatibilidad += "\n" + resultadoCompatibilidad;   

                } // Fin de if(esDudaCompatibilidad)

                
                // B. Consulta general de stock/catálogo
                else if (
                    mensajeUsuario.Contains("stock") ||
                    mensajeUsuario.Contains("catálogo") ||
                    mensajeUsuario.Contains("catalogo"))
                {
                    return Ok(new
                    {
                        texto = await ObtenerTodoElInventario(),
                        opciones = new List<string>()
                    });
                }
                                
                // C. Búsqueda por Marca + Categoría 
                else if (categoriaBuscada != null && marcaBuscada != null)
                {
                    contextoInventario = await ConsultarInventarioInterno(categoriaBuscada, marcaBuscada, socketBuscado, ramBuscada);
                }

                // D. Compatibilidad Ancla + Categoría 
                else if (
                    componenteAncla != null &&
                    categoriaBuscada != null
                )
                {
                    // Filtrar sólo la categoría que el usuario pidió
                    var candidatos = todosLosComponentes
                        .Where(c =>
                            c.Tipo.ToString().Equals(
                                categoriaBuscada,
                                StringComparison.OrdinalIgnoreCase))
                        .ToList();

                    // Compatibles reales
                    var compatibles =
                        _buildCompatibilityService
                            .FiltrarCompatibles(
                                componenteAncla,
                                candidatos);

                    if (compatibles.Any())
                    {
                        contextoInventario =
                            string.Join("\n",
                                compatibles.Select(c =>
                                    $"- {c.Nombre} | Tipo: {c.Tipo} | Precio: ${c.Precio}"
                                ));

                        contextoCompatibilidad =
                            $"Estos componentes son compatibles con {componenteAncla.Nombre}.";

                        componentesBotones.AddRange(
                            compatibles
                                .Select(c => c.Nombre)
                                .Take(5));
                    }
                    else
                    {
                        contextoInventario = "SIN STOCK";
                    }
                }

                // E. Categoría sola (Exploración) 
                else if (categoriaBuscada != null && !esPreguntaEducativa)
                {
                    var inventario =
                        await ConsultarInventarioInterno(
                            categoriaBuscada,
                            marcaBuscada, socketBuscado,
                            ramBuscada);

                    if (
                        inventario == "SIN STOCK" ||
                        inventario == "Categoría no reconocida.")
                    {
                        return Ok(new
                        {
                            texto =
                                "Actualmente no tengo componentes disponibles de esa categoría.",
                            opciones = new List<string>()
                        });
                    }

                    string categoriaTexto = categoriaBuscada switch
                    {
                        "PlacaBase" => "motherboards",
                        "CPU" => "procesadores",
                        "MemoriaRAM" => "memorias RAM",
                        "GPU" => "tarjetas gráficas",
                        _ => "componentes"
                    };

                    return Ok(new
                    {
                        texto =
                            $"Actualmente tengo estos {categoriaTexto} disponibles:\n\n" +
                            inventario,

                        opciones = new List<string>()
                    });
                }

                // F. Ancla sola
                else if (componenteAncla != null)
                {
                    contextoInventario = 
                    $"- {componenteAncla.Nombre} | " + 
                    $"Tipo: {componenteAncla.Tipo} | " + 
                    $"Socket: {componenteAncla.Socket} | " +
                    $"RAM: {componenteAncla.TipoMemoria}";
                }

                // --- LÓGICA AL PRESIONAR UN BOTÓN DE OPCIONES -- //
                bool esSeleccionBoton = 
                    componenteAncla != null && 
                    Normalizar(componenteAncla.Nombre) == Normalizar(request.Mensaje);
                
                if (esSeleccionBoton)
                {
                    return Ok(new
                    {
                        texto = 
                        $"{componenteAncla?.Nombre} | Precio: ${componenteAncla?.Precio}",
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
                    "- Si no hay stock, dilo claramente.\n" +
                    "- Si falta un dato técnico, responde 'No especificado en inventario'.\n" +
                    "- No confundas socket AM4 con AM5 en los componentes\n" +
                    "- Nunca asumas sockets o chipsets.\n" +
                    "- Para preguntas educativas puedes explicar conceptos técnicos de forma sencilla.\n" +
                    "- Cuando menciones productos, usa únicamente componentes del inventario.\n\n" +

                    "RESPUESTA:\n" +
                    "- Explica breve y técnicamente.\n" +
                    "- Sé directo.\n" +
                    "- No respondas temas no técnicos.\n" +
                    "- Tu respuesta debe sonar natural y conversacional.\n" +
                    "- NO respondas como sistema automatizado.\n" +
                    "- Explica compatibilidades de forma sencilla y profesional.\n" +
                    "- Ejemplo:\n" +
                        "'Sí, ambos componentes son compatibles porque utilizan socket AM5.'\n" +
                    "- Evita frases como:\n"+
                        "'RESULTADO REAL'\n"+
                        "'REGLA DE ORO'\n"+
                        "'SISTEMA'\n"+
                    "- Habla como un asesor técnico experto.\n\n" +

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
                if (string.IsNullOrEmpty(contextoInventario) && !string.IsNullOrEmpty(categoriaBuscada) && !esPreguntaEducativa)
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
        private async Task<string> ConsultarInventarioInterno(
            string tipoStr, 
            string? marca = null, 
            string? socket = null, 
            string? ram = null)
        {
            if (!Enum.TryParse(tipoStr, true, out TipoComponente tipoEnum)) return "Categoría no reconocida.";

            var query = _context.Componentes
                .AsNoTracking()
                .Where(c => c.Tipo == tipoEnum && c.EstaActivo);

            if (!string.IsNullOrEmpty(marca))
                query = query.Where(c => EF.Functions.ILike(c.Nombre, $"%{marca}%"));
            
            if (!string.IsNullOrWhiteSpace(socket))
            {
                query = query.Where(c =>
                    c.Socket != null &&
                    c.Socket.ToUpper() == socket.ToUpper());
            }

            if (!string.IsNullOrWhiteSpace(ram))
            {
                query = query.Where(c =>
                    c.TipoMemoria != null &&
                    c.TipoMemoria.ToUpper() == ram.ToUpper());
            }

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

            string? ddrDetectado = null;

            if (texto.Contains("ddr5"))
                ddrDetectado = "DDR5";

            if (texto.Contains("ddr4"))
                ddrDetectado = "DDR4";

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

                // Detección del tipo de memoria del componente
                if (
                    componente.Tipo == TipoComponente.MemoriaRAM &&
                    ddrDetectado != null
                )
                {
                    if (
                        componente.TipoMemoria?.ToUpper() !=
                        ddrDetectado.ToUpper()
                    )
                    {
                        continue;
                    }
}
            }

            return resultados
                .DistinctBy(c => c.ComponenteId)
                .OrderByDescending(c =>
                    Normalizar(textoUsuario)
                        .Split(' ')
                        .Count(p =>
                            Normalizar(c.Nombre).Contains(p)))
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
            {
                Console.WriteLine("=== COMPONENTES DETECTADOS (mensaje actual) ===");

                foreach (var c in encontrados)
                {
                    Console.WriteLine(
                        $"{c.Nombre} | {c.Tipo} | {c.TipoMemoria}");
                }

                return encontrados;
            }

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
                    {
                        Console.WriteLine("=== COMPONENTES DETECTADOS (historial) ===");

                        foreach (var c in encontrados)
                        {
                            Console.WriteLine(
                                $"{c.Nombre} | {c.Tipo} | {c.TipoMemoria}");
                        }

                        return encontrados;
                    }
                }
            }

            Console.WriteLine("=== NO SE DETECTARON COMPONENTES ===");

            return new List<Componente>();
        }

        // Este método detecta una categoría de componente desde el historial de la conversación
        private string? DetectarCategoriaDesdeHistorial(
            string mensajeActual,
            List<MensajeChat>? historial)
        {
            // Intentar detectar en mensaje actual
            var categoria =
                DetectarCategoriaBuscada(mensajeActual);

            if (categoria != null)
                return categoria;

            // Buscar hacia atrás en historial
            if (historial != null)
            {
                foreach (var msg in historial.AsEnumerable().Reverse())
                {
                    categoria =
                        DetectarCategoriaBuscada(msg.Contenido);

                    if (categoria != null)
                        return categoria;
                }
            }

            return null;
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
