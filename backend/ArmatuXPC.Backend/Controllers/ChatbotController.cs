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
        private readonly OllamaService _ollamaService;
        private readonly BuildCompatibilityService _buildCompatibilityService;


        public ChatbotController(
            AppDbContext context,
            OllamaService ollamaService,
            BuildCompatibilityService buildCompatibilityService)
        {
            _context = context;
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
                    mensajeUsuario.Contains("para qué sirve") ||
                    mensajeUsuario.Contains("como funciona") ||
                    mensajeUsuario.Contains("cómo funciona");
                
                // C. Detectar consulta de disponibilidad en inventario
                bool esConsultaDisponibilidad =
                    mensajeUsuario.Contains("tienes") ||
                    mensajeUsuario.Contains("disponible") ||
                    mensajeUsuario.Contains("disponibles") ||
                    mensajeUsuario.Contains("están disponibles") ||
                    mensajeUsuario.Contains("estan disponibles") ||
                    mensajeUsuario.Contains("stock") ||
                    mensajeUsuario.Contains("inventario") ||
                    mensajeUsuario.Contains("catálogo") ||
                    mensajeUsuario.Contains("catalogo") ||
                    mensajeUsuario.Contains("manejas") ||
                    mensajeUsuario.Contains("hay");
                
                // D. Detectar recomendación solicitada por usuario para escoger un componente
                bool esRecomendacion =
                    mensajeUsuario.Contains("recomiendas") ||
                    mensajeUsuario.Contains("me recomiendas") ||
                    mensajeUsuario.Contains("recomendar") ||
                    mensajeUsuario.Contains("mejor opción") ||
                    mensajeUsuario.Contains("mejor opcion");

                // E. Detectar preguntas sobre el Gabinete, Fuente y Refrigeración
                bool preguntaGabinete =
                    mensajeUsuario.Contains("gabinete") ||
                    mensajeUsuario.Contains("gabinetes") ||
                    mensajeUsuario.Contains("case") ||
                    mensajeUsuario.Contains("caja");

                 // Recomendación
                bool preguntaFuente =
                    mensajeUsuario.Contains("fuente") ||
                    mensajeUsuario.Contains("fuentes") ||
                    mensajeUsuario.Contains("psu") ||
                    mensajeUsuario.Contains("suficiente") ||
                    mensajeUsuario.Contains("watts");

                // disponibilidad inventario
                bool preguntaInventarioFuente =
                    preguntaFuente &&
                    (
                        mensajeUsuario.Contains("hay") ||
                        mensajeUsuario.Contains("tienes") ||
                        mensajeUsuario.Contains("disponibles")
                    );
                
                // Recomendación
                bool preguntaRefrigeracion =
                    mensajeUsuario.Contains("refrigeración") ||
                    mensajeUsuario.Contains("refrigeracion") ||
                    mensajeUsuario.Contains("cooler") ||
                    mensajeUsuario.Contains("ventilador") ||
                    mensajeUsuario.Contains("ventiladores") ||
                    mensajeUsuario.Contains("enfriamiento");
                
                // disponibilidad inventario
                bool preguntaInventarioRefrigeracion =
                    preguntaRefrigeracion &&
                    (
                        mensajeUsuario.Contains("hay") ||
                        mensajeUsuario.Contains("tienes") ||
                        mensajeUsuario.Contains("disponible")
                    );

                // F. Detección de pregunta para excluír selección de botón si no es necesario
                bool parecePregunta =
                    request.Mensaje.Contains("?") ||
                    mensajeUsuario.StartsWith("qué") ||
                    mensajeUsuario.StartsWith("que") ||
                    mensajeUsuario.StartsWith("cuál") ||
                    mensajeUsuario.StartsWith("cual") ||
                    mensajeUsuario.StartsWith("y qué") ||
                    mensajeUsuario.StartsWith("y que");
                
                // G. Parecidos en componente Motherboard
                bool pareceMotherboard =
                    mensajeUsuario.Contains("asus") ||
                    mensajeUsuario.Contains("msi") ||
                    mensajeUsuario.Contains("gigabyte") ||
                    mensajeUsuario.Contains("asrock") ||
                    mensajeUsuario.Contains("z790") ||
                    mensajeUsuario.Contains("z690") ||
                    mensajeUsuario.Contains("z890") ||
                    mensajeUsuario.Contains("b650") ||
                    mensajeUsuario.Contains("b550") ||
                    mensajeUsuario.Contains("x570");

                // H. Compatibilidad directa entre componentes
                bool preguntaCompatibilidadDirecta =
                    mensajeUsuario.Contains("es compatible") ||
                    mensajeUsuario.Contains("compatible con") ||
                    mensajeUsuario.Contains("compatibles") ||
                    mensajeUsuario.Contains("funciona con") ||
                    mensajeUsuario.Contains("sirve con");

                // I. Compatibilidad directa de CPU con Motherboard
                bool pideListaCompatibles =
                    mensajeUsuario.Contains("qué cpu") ||
                    mensajeUsuario.Contains("que cpu") ||
                    mensajeUsuario.Contains("qué cpus") ||
                    mensajeUsuario.Contains("que cpus") ||
                    mensajeUsuario.Contains("procesadores compatibles") ||
                    mensajeUsuario.Contains("cpus compatibles");

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
                    DetectarComponenteSoloHistorial(
                        todosLosComponentes,
                        request.Historial);
                
                // 4. Si el usuario escribió exactamente un botón, responder detalle
                var componenteSeleccionadoActual =
                    componentesMensajeActual.FirstOrDefault(c =>
                        Normalizar(c.Nombre) == Normalizar(request.Mensaje));

                bool esSeleccionBoton =
                    componenteSeleccionadoActual != null &&
                    !esPreguntaEducativa &&
                    !parecePregunta; 

                // Validación de botón
                if (esSeleccionBoton)
                {
                    return Ok(new
                    {
                        texto =
                            $"{componenteSeleccionadoActual?.Nombre} | Precio: ${componenteSeleccionadoActual?.Precio}",
                        opciones = new List<string>()
                    });
                }

                // 5. Prioridad:
                // mensaje actual > historial
                var componentesDetectados =
                    componentesMensajeActual.Any()
                    ? componentesMensajeActual
                    : componentesHistorial;

                // 6. Componente ancla
                var componenteAncla =
                    componentesDetectados.FirstOrDefault();
                
                // Evitar que entre en Ollama siempre sin tomar en cuenta mi inventario
                var cpuActual = componentesMensajeActual
                    .FirstOrDefault(c => c.Tipo == TipoComponente.CPU);

                var motherboardActual = componentesMensajeActual
                    .FirstOrDefault(c => c.Tipo == TipoComponente.PlacaBase);

                var ramActual = componentesMensajeActual
                    .FirstOrDefault(c => c.Tipo == TipoComponente.MemoriaRAM);

                Console.WriteLine($"CPU actual: {cpuActual?.Nombre ?? "NULL"} | Socket: {cpuActual?.Socket ?? "NULL"}");
                Console.WriteLine($"Motherboard actual: {motherboardActual?.Nombre ?? "NULL"} | Socket: {motherboardActual?.Socket ?? "NULL"}");
                Console.WriteLine($"preguntaCompatibilidadDirecta: {preguntaCompatibilidadDirecta}");

                // CPU ↔ Motherboard directo
                if (
                    preguntaCompatibilidadDirecta &&
                    cpuActual != null &&
                    motherboardActual != null &&
                    !esPreguntaEducativa
                )
                {
                    Console.WriteLine("=== RETURN C# COMPATIBILIDAD DIRECTA ===");

                    bool compatibles =
                        _buildCompatibilityService
                            .CPUCompatibleMotherboard(cpuActual, motherboardActual);

                    return Ok(new
                    {
                        texto = compatibles
                            ? $"Sí, el {cpuActual.Nombre} es compatible con la {motherboardActual.Nombre} porque ambos usan socket {cpuActual.Socket}."
                            : $"No, el {cpuActual.Nombre} no es compatible con la {motherboardActual.Nombre}. El CPU usa socket {cpuActual.Socket} y la motherboard usa socket {motherboardActual.Socket}.",

                        opciones = new List<string>()
                    });
                }

                // Detección de categoria del mensaje actual del usuario
                string? categoriaMensajeActual =
                    DetectarCategoriaBuscada(mensajeUsuario);

                // Detección de categoría del historial de mensajes del usuario
                string? categoriaBuscada =
                    categoriaMensajeActual ??
                    DetectarCategoriaDesdeHistorial(
                        request.Mensaje,
                        request.Historial);

                // H. Consulta categoría de componente y marca
                bool consultaCategoriaOMarca =
                    categoriaBuscada != null &&
                    (
                        mensajeUsuario.Contains("qué") ||
                        mensajeUsuario.Contains("que") ||
                        mensajeUsuario.Contains("cuáles") ||
                        mensajeUsuario.Contains("cuales")
                    );

                // Consulta específica Intel i5
                if (
                    esConsultaDisponibilidad &&
                    mensajeUsuario.Contains("intel") &&
                    mensajeUsuario.Contains("i5")
                )
                {
                    var i5Disponibles = todosLosComponentes
                        .Where(c =>
                            c.Tipo == TipoComponente.CPU &&
                            c.Nombre.ToLower().Contains("i5"))
                        .ToList();

                    if (!i5Disponibles.Any())
                    {
                        var alternativasIntel = todosLosComponentes
                            .Where(c =>
                                c.Tipo == TipoComponente.CPU &&
                                (
                                    c.Marca.ToLower().Contains("intel") ||
                                    c.Nombre.ToLower().Contains("intel")
                                ))
                            .Take(5)
                            .ToList();

                        return Ok(new
                        {
                            texto =
                                "Actualmente no tengo procesadores Intel i5 disponibles en inventario.\n\n" +
                                "Pero tengo estas alternativas Intel:\n\n" +
                                string.Join("\n", alternativasIntel.Select(c =>
                                    $"- {c.Nombre} | Socket: {c.Socket ?? "N/A"} | Precio: ${c.Precio}"
                                )),

                            opciones = alternativasIntel
                                .Select(c => c.Nombre)
                                .ToList()
                        });
                    }
                }

                // búsqueda por marca de componente
                string? marcaBuscada = null; 
            
                // Detección de marcas comunes
                if (mensajeUsuario.Contains("intel")){
                    marcaBuscada = "Intel";
                    categoriaBuscada = "CPU";
                }
                if (mensajeUsuario.Contains("amd")){
                    marcaBuscada = "AMD";
                    categoriaBuscada = "CPU";
                }
                if (mensajeUsuario.Contains("nvidia")){
                    marcaBuscada = "NVIDIA";
                    categoriaBuscada = "GPU";
                }

                // Inferencia automática
                if (categoriaBuscada == null && marcaBuscada == "Intel")
                {
                    categoriaBuscada = "CPU";
                }

                if (categoriaBuscada == null && marcaBuscada == "AMD")
                {
                    categoriaBuscada = "CPU";
                }

                if (categoriaBuscada == null && marcaBuscada == "NVIDIA")
                {
                    categoriaBuscada = "GPU";
                }

                // Detectar socket
                string? socketBuscado = null;

                var socketsValidos = new[]
                {   
                    "AM4",
                    "AM5",
                    "LGA1700",
                    "LGA1851"
                };

                // Recorrido foreach para encontrar resultados de sockets válidos
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

                // --- 3. Construcción inteligente del Inventario (Filtrado por BD) --- //

                string resultadoCompatibilidad = "";
                                
                // Listas de componentes compatibles
                List<Componente> cpusCompatibles = new();
                List<Componente> ramCompatibles = new();

                // --- BLOQUE IMPORTANTE: 4. Compatibilidad Avanzada --- //

                // Si hay duda de compatibilidad, es recomendación o pregunta de inventario sobre fuente o refrigeración
                if (
                    esDudaCompatibilidad ||
                    esRecomendacion ||
                    (
                        preguntaFuente &&
                        !preguntaInventarioFuente
                    ) ||
                    (
                        preguntaRefrigeracion &&
                        !preguntaInventarioRefrigeracion
                    )
                )
                {
                        // DETECCIÓN DE COMPONENTES (cpu, motherboard y ram)
                        var cpu = componentesDetectados
                            .FirstOrDefault(c => c.Tipo == TipoComponente.CPU);

                        var motherboard = componentesDetectados
                            .FirstOrDefault(    c => c.Tipo == TipoComponente.PlacaBase);
                        
                        var ram = componentesDetectados
                            .FirstOrDefault(c => c.Tipo == TipoComponente.MemoriaRAM);
                        
                        // Limpieza de datos
                        if (preguntaGabinete)
                        {
                            ram = null;
                        }

                        if (preguntaFuente)
                        {
                            ram = null;
                        }

                        // Recomendación de Placa Base para un CPU en específico
                        if (
                            categoriaBuscada == null &&
                            cpu != null &&
                            esRecomendacion
                        )
                        {
                            categoriaBuscada = "PlacaBase";
                        }

                        // Si el usuario menciona explícitamente DDR4/DDR5,
                        // no reutilices motherboard/RAM del historial.
                        if (!string.IsNullOrWhiteSpace(ramBuscada))
                        {
                            motherboard = null;
                            ram = null;
                        }

                         // --- Motherboards compatibles con DDR4/DDR5 --- //
                        if (
                            ram == null &&
                            !string.IsNullOrWhiteSpace(ramBuscada) &&
                            (
                                mensajeUsuario.Contains("motherboard") ||
                                mensajeUsuario.Contains("motherboards") ||
                                mensajeUsuario.Contains("placa") ||
                                mensajeUsuario.Contains("placas") ||
                                mensajeUsuario.Contains("tarjeta madre") ||
                                mensajeUsuario.Contains("tarjetas madre")
                            )
                        )
                        {
                            var motherboardsCompatibles = todosLosComponentes
                                .Where(c =>
                                    c.Tipo == TipoComponente.PlacaBase &&
                                    c.TipoMemoria != null &&
                                    c.TipoMemoria.Trim().ToUpper() ==
                                    ramBuscada.Trim().ToUpper())
                                .Take(5)
                                .ToList();

                            if (motherboardsCompatibles.Any())
                            {
                                return Ok(new
                                {
                                    texto =
                                        $"Motherboards compatibles con memoria {ramBuscada}:\n\n" +

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

                         // --- Compatibilidad directa entre CPU y Motherboard --- //
                        if (preguntaCompatibilidadDirecta && !esPreguntaEducativa && cpu != null && motherboard != null)
                        {
                            bool compatibles =
                                _buildCompatibilityService
                                    .CPUCompatibleMotherboard(cpu, motherboard);
                            
                            return Ok(new
                                {
                                    texto = compatibles
                                        ? $"Sí, el {cpu.Nombre} es compatible con la {motherboard.Nombre} porque ambos usan socket {cpu.Socket}."
                                        : $"No, el {cpu.Nombre} no es compatible con la {motherboard.Nombre}. El CPU usa socket {cpu.Socket} y la motherboard usa socket {motherboard.Socket}.",
                                    
                                    opciones = new List<string>()
                                });
                            
                        }

                        // Compatibilidad directa entre RAM y Motherboard
                        if (
                            preguntaCompatibilidadDirecta &&
                            ram != null &&
                            motherboard != null
                        )
                        {
                            bool compatibles =
                                _buildCompatibilityService
                                    .RAMCompatibleMotherboard(
                                        ram,
                                        motherboard);

                            return Ok(new
                            {
                                texto = compatibles
                                    ? $"Sí, la RAM {ram.Nombre} es compatible con la {motherboard.Nombre} porque ambas utilizan memoria {ram.TipoMemoria}."
                                    : $"No, la RAM {ram.Nombre} no es compatible con la {motherboard.Nombre}. La RAM usa {ram.TipoMemoria} y la motherboard soporta {motherboard.TipoMemoria}.",

                                opciones = new List<string>()
                            });
                        }

                       // --- CPU Compatible --- //
                        if (
                            !esPreguntaEducativa &&
                            motherboard != null &&
                            pideListaCompatibles &&
                            (
                                mensajeUsuario.Contains("cpu") ||
                                mensajeUsuario.Contains("procesador") ||
                                mensajeUsuario.Contains("intel") ||
                                mensajeUsuario.Contains("amd")
                            )
                            &&
                            !mensajeUsuario.Contains("ram") &&
                            !mensajeUsuario.Contains("memoria") &&
                            !mensajeUsuario.Contains("placa") &&
                            !mensajeUsuario.Contains("ddr")
                        )
                        {
                            cpusCompatibles =
                                _buildCompatibilityService
                                    .FiltrarCompatibles(
                                        motherboard,
                                        todosLosComponentes)
                                    .Where(c =>
                                        c.Tipo == TipoComponente.CPU)
                                    .Where(c =>
                                        marcaBuscada == null ||
                                        c.Nombre.ToUpper().Contains(marcaBuscada.ToUpper()))
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
                        
                       
                        // --- Motherboards compatibles con RAM --- //
                        if (
                            !esPreguntaEducativa &&
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
                                    .OrderByDescending(c => c.Precio)
                                    .Take(5)
                                    .ToList();

                              if (motherboardsCompatibles.Any())
                            {
                                var recomendada = motherboardsCompatibles.First();

                                    return Ok(new
                                    {
                                        texto =
                                            $"Para la memoria RAM {ram.Nombre} de tipo ´{ram.TipoMemoria}, te recomiendo la motherboard {recomendada.Nombre}.\n\n" +

                                            $"Características principales:\n" +
                                            $"- Socket: {recomendada.Socket}\n" +
                                            $"- RAM compatible: {recomendada.TipoMemoria}\n" +
                                            $"- Precio: ${recomendada.Precio}\n\n" +

                                            "Otras opciones compatibles disponibles:\n\n" +

                                            string.Join("\n",
                                                motherboardsCompatibles
                                                .Skip(1)
                                                .Select(m =>
                                                    $"- {m.Nombre} | Socket: {m.Socket} | RAM: {m.TipoMemoria} | Precio: ${m.Precio}"
                                                )
                                            ),

                                        opciones = motherboardsCompatibles
                                            .Skip(1)
                                            .Select(m => m.Nombre)
                                            .Distinct()
                                            .ToList()
                                    });
                                }
                        }

                        // --- RAM compatibles con CPU --- //
                        if (
                            !esPreguntaEducativa &&
                            cpu != null &&
                            motherboard == null &&
                            (
                                mensajeUsuario.Contains("ram") ||
                                mensajeUsuario.Contains("memoria")
                            )
                        )
                        {
                            var motherboardsCompatibles =
                                _buildCompatibilityService
                                    .FiltrarCompatibles(cpu, todosLosComponentes)
                                    .Where(c => c.Tipo == TipoComponente.PlacaBase)
                                    .ToList();

                            var tiposDDR = motherboardsCompatibles
                                .Where(m => !string.IsNullOrWhiteSpace(m.TipoMemoria))
                                .Select(m => m.TipoMemoria!.Trim().ToUpper())
                                .Distinct()
                                .ToList();

                            var ramsCompatibles = todosLosComponentes
                                .Where(c =>
                                    c.Tipo == TipoComponente.MemoriaRAM &&
                                    c.TipoMemoria != null &&
                                    tiposDDR.Contains(c.TipoMemoria.Trim().ToUpper()))
                                .Take(5)
                                .ToList();

                            if (ramsCompatibles.Any())
                            {
                                return Ok(new
                                {
                                    texto =
                                        $"Memorias RAM compatibles con {cpu.Nombre}:\n\n" +
                                        string.Join("\n", ramsCompatibles.Select(r =>
                                            $"- {r.Nombre} | Tipo: {r.TipoMemoria} | Precio: ${r.Precio}"
                                        )),

                                    opciones = ramsCompatibles
                                        .Select(r => r.Nombre)
                                        .ToList()
                                });
                            }
                        }

                        // --- RAM Compatible --- //
                        if (
                            !esPreguntaEducativa &&
                            motherboard != null &&
                            (
                                mensajeUsuario.Contains("ram") ||
                                mensajeUsuario.Contains("memoria") ||
                                mensajeUsuario.Contains("ddr")
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


                        // --- Motherboards compatibles con CPU --- //
                        if (
                            !esPreguntaEducativa &&
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
                                    .OrderByDescending(c => c.Precio)
                                    .Take(5)
                                    .ToList();

                            if (motherboardsCompatibles.Any())
                            {
                                var recomendada = motherboardsCompatibles.First();

                                    return Ok(new
                                    {
                                        texto =
                                            $"Para el procesador {cpu.Nombre} con socket {cpu.Socket}, te recomiendo la motherboard {recomendada.Nombre}.\n\n" +

                                            $"Características principales:\n" +
                                            $"- Socket: {recomendada.Socket}\n" +
                                            $"- RAM compatible: {recomendada.TipoMemoria}\n" +
                                            $"- Precio: ${recomendada.Precio}\n\n" +

                                            "Otras opciones compatibles disponibles:\n\n" +

                                            string.Join("\n",
                                                motherboardsCompatibles
                                                .Skip(1)
                                                .Select(m =>
                                                    $"- {m.Nombre} | Socket: {m.Socket} | RAM: {m.TipoMemoria} | Precio: ${m.Precio}"
                                                )
                                            ),

                                        opciones = motherboardsCompatibles
                                            .Skip(1)
                                            .Select(m => m.Nombre)
                                            .Distinct()
                                            .ToList()
                                    });
                                }
                        }    

                        // --- Gabinetes compatibles con Motherboard --- //
                        if (
                            !esPreguntaEducativa &&
                            motherboard != null &&
                            preguntaGabinete
                        )
                        {
                            var gabinetesCompatibles =
                                _buildCompatibilityService
                                    .FiltrarCompatibles(
                                        motherboard,
                                        todosLosComponentes)
                                    .Where(c => c.Tipo == TipoComponente.Gabinete)
                                    .OrderByDescending(c => c.Precio)
                                    .Take(5)
                                    .ToList();

                            if (gabinetesCompatibles.Any())
                            {
                                var recomendado = gabinetesCompatibles.First();

                                return Ok(new
                                {
                                    texto =
                                        $"Para la motherboard {motherboard.Nombre} con factor de forma {motherboard.FactorForma}, te recomiendo el gabinete {recomendado.Nombre}.\n\n" +

                                        $"Características principales:\n" +
                                        $"- Compatibilidad: {recomendado.FactorForma}\n" +
                                        $"- Precio: ${recomendado.Precio}\n\n" +

                                        "Otras opciones compatibles disponibles:\n\n" +

                                        string.Join("\n",
                                            gabinetesCompatibles
                                            .Skip(1)
                                            .Select(g =>
                                                $"- {g.Nombre} | Compatibilidad: {g.FactorForma} | Precio: ${g.Precio}"
                                            )
                                        ),

                                    opciones = gabinetesCompatibles
                                        .Select(g => g.Nombre)
                                        .Distinct()
                                        .ToList()
                                });
                            }
                        }

                        // --- Inventario de fuentes --- //
                        if (
                            !esPreguntaEducativa &&
                            preguntaInventarioFuente
                        )
                        {
                            var fuentes = todosLosComponentes
                                .Where(c =>
                                    c.Tipo == TipoComponente.FuentePoder)
                                .Take(5)
                                .ToList();

                            if (fuentes.Any())
                            {
                                return Ok(new
                                {
                                    texto =
                                        "Actualmente tengo estas fuentes de poder disponibles:\n\n" +

                                        string.Join("\n",
                                            fuentes.Select(f =>
                                                $"- {f.Nombre} | Potencia: {f.CapacidadWatts}W | Precio: ${f.Precio}"
                                            )),

                                    opciones = fuentes
                                        .Select(f => f.Nombre)
                                        .ToList()
                                });
                            }
                        }

                        // --- Fuente suficiente --- //
                        if (
                            !esPreguntaEducativa &&
                            preguntaFuente &&
                            !preguntaInventarioFuente
                        )
                        {
                            var fuentes =
                                todosLosComponentes
                                    .Where(c =>
                                        c.Tipo == TipoComponente.FuentePoder &&
                                        c.CapacidadWatts != null)
                                    .OrderByDescending(c => c.CapacidadWatts)
                                    .Take(5)
                                    .ToList();

                            if (fuentes.Any())
                            {
                                var recomendada = fuentes.First();

                                return Ok(new
                                {
                                    texto =
                                        $"Para esta configuración te recomiendo la fuente {recomendada.Nombre}.\n\n" +

                                        $"Características principales:\n" +
                                        $"- Potencia: {recomendada.CapacidadWatts}W\n" +
                                        $"- Precio: ${recomendada.Precio}\n\n" +

                                        "Otras opciones compatibles disponibles:\n\n" +

                                        string.Join("\n",
                                            fuentes
                                            .Skip(1)
                                            .Select(f =>
                                                $"- {f.Nombre} | Potencia: {f.CapacidadWatts}W | Precio: ${f.Precio}"
                                            )
                                        ),

                                    opciones = fuentes
                                        .Select(f => f.Nombre)
                                        .Take(5)
                                        .ToList()
                                });
                            }
                        }

                        // --- Refrigeración recomendada --- //
                        if (
                            !esPreguntaEducativa &&
                            preguntaRefrigeracion
                        )
                        {
                            var coolers = todosLosComponentes
                                .Where(c =>
                                    c.Tipo == TipoComponente.Refrigeracion)
                                .OrderByDescending(c => c.Precio)
                                .Take(5)
                                .ToList();

                            if (coolers.Any())
                            {
                                var recomendado = coolers.First();

                                return Ok(new
                                {
                                    texto =
                                        $"Para esta configuración te recomiendo el sistema de refrigeración {recomendado.Nombre}.\n\n" +

                                        $"Características principales:\n" +
                                        $"- Consumo: {recomendado.ConsumoWatts}W\n" +
                                        $"- Precio: ${recomendado.Precio}\n\n" +

                                        "Otras opciones disponibles:\n\n" +

                                        string.Join("\n",
                                            coolers
                                                .Skip(1)
                                                .Select(r =>
                                                    $"- {r.Nombre} | Precio: ${r.Precio}"
                                                )
                                        ),

                                    opciones = coolers
                                        .Select(r => r.Nombre)
                                        .ToList()
                                });
                            }
                        }

                    // Si motherboard es compatible con una RAM buscada por el usuario
                    if (!esPreguntaEducativa && motherboard != null && !string.IsNullOrWhiteSpace(ramBuscada))
                    {
                        bool compatible =
                            motherboard.TipoMemoria != null &&
                            motherboard.TipoMemoria.Trim().ToUpper() ==
                            ramBuscada.Trim().ToUpper();

                        return Ok(new
                        {
                            texto = compatible
                                ? $"Sí, la {motherboard.Nombre} soporta memoria {ramBuscada}."
                                : $"No, la {motherboard.Nombre} no soporta {ramBuscada}. Esta motherboard utiliza memoria {motherboard.TipoMemoria}.",
                            opciones = new List<string>()
                        });
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
                             if (c.Tipo == TipoComponente.Gabinete)
                             {
                                return $"- {c.Nombre} | PlacaBase | Precio:{c.Precio} | Factor Forma:{c.FactorForma}"; 
                             }
                             
                             return $"- {c.Nombre}"; 
                        })); 
                    
                    contextoCompatibilidad = 
                        "REGLA DE ORO: Si Socket de CPU == Socket de Placa, SON COMPATIBLES. " + 
                        "Si Memoria RAM == Memoria de Placa, SON COMPATIBLES." + 
                        "Esta REGLA DE ORO tú lo sabes pero no se lo digas al usuario, sólo úsalo a tu favor" +
                        "Usa estas reglas internamente: CPU y motherboard deben compartir socket. RAM y motherboard deben compartir tipo DDR. No menciones estas reglas como 'regla de oro'.";

                        contextoCompatibilidad += "\n" + resultadoCompatibilidad;   

                } // Fin de if(esDudaCompatibilidad)

                // -- BLOQUES DE CONSULTA A LA BD DEL INVENTARIO -- //
                
                // A. Consulta general de stock/catálogo
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

                // B. Búsqueda por componente exacto
                if (
                    esConsultaDisponibilidad &&
                    !esPreguntaEducativa && 
                    !consultaCategoriaOMarca
                )
                {
                    var textoNormalizado =
                        Normalizar(request.Mensaje);

                    // Buscar coincidencia exacta
                    var exacto = todosLosComponentes
                        .FirstOrDefault(c =>
                            textoNormalizado.Contains(
                                Normalizar(c.Nombre)) ||

                            textoNormalizado.Contains(
                                Normalizar(c.Modelo))
                        );

                    // SI EXISTE
                    if (exacto != null)
                    {
                        // Detalles de producto según los campos adecuados a mostras por tipo de componente
                        string detalles = exacto.Tipo switch
                        {
                            TipoComponente.CPU =>
                                $"Socket: {exacto.Socket ?? "N/A"}",

                            TipoComponente.PlacaBase =>
                                $"Socket: {exacto.Socket ?? "N/A"}\n" +
                                $"RAM: {exacto.TipoMemoria ?? "N/A"}\n" +
                                $"Chipset: {exacto.Chipset ?? "N/A"}",

                            TipoComponente.MemoriaRAM =>
                                $"Tipo de memoria: {exacto.TipoMemoria ?? "N/A"}",

                            TipoComponente.GPU =>
                                $"Consumo: {exacto.ConsumoWatts ?? 0}W",

                            TipoComponente.FuentePoder =>
                                $"Capacidad: {exacto.CapacidadWatts ?? 0}W",

                            _ =>
                                $"Consumo: {exacto.ConsumoWatts ?? 0}W"
                        };

                        return Ok(new
                        {
                            texto =
                                $"Sí, tengo {exacto.Nombre} disponible.\n\n" +
                                $"Precio: ${exacto.Precio}\n" +
                                $"Tipo: {exacto.Tipo}\n" +
                                detalles,

                            opciones = new List<string>()
                        });
                    }

                    // SI NO EXISTE → alternativas
                    bool pareceModeloEspecifico =
                        mensajeUsuario.Contains("asus") ||
                        mensajeUsuario.Contains("msi") ||
                        mensajeUsuario.Contains("gigabyte") ||
                        mensajeUsuario.Contains("intel") ||
                        mensajeUsuario.Contains("amd") ||
                        mensajeUsuario.Contains("ryzen") ||
                        mensajeUsuario.Contains("rtx") ||
                        mensajeUsuario.Contains("i3") ||
                        mensajeUsuario.Contains("i5") ||
                        mensajeUsuario.Contains("i7") ||
                        mensajeUsuario.Contains("i9") ||
                        mensajeUsuario.Contains("ryzen 5") ||
                        mensajeUsuario.Contains("ryzen 7") ||
                        mensajeUsuario.Contains("ryzen 9") ||
                        mensajeUsuario.Contains("z790") ||
                        mensajeUsuario.Contains("z690") ||
                        mensajeUsuario.Contains("b650") ||
                        mensajeUsuario.Contains("b550") ||
                        mensajeUsuario.Contains("x570");

                    if (pareceModeloEspecifico)
                    {
                        if (
                            mensajeUsuario.Contains("asus") ||
                            mensajeUsuario.Contains("msi") ||
                            mensajeUsuario.Contains("gigabyte") ||
                            mensajeUsuario.Contains("asrock") ||
                            mensajeUsuario.Contains("z790") ||
                            mensajeUsuario.Contains("z690") ||
                            mensajeUsuario.Contains("z890") ||
                            mensajeUsuario.Contains("b650") ||
                            mensajeUsuario.Contains("b550") ||
                            mensajeUsuario.Contains("x570")
                        )
                        {
                            categoriaBuscada = "PlacaBase";
                        }
                        // Inferir categoría automáticamente
                        if (
                            mensajeUsuario.Contains("intel") ||
                            mensajeUsuario.Contains("amd") ||
                            mensajeUsuario.Contains("ryzen") ||
                            mensajeUsuario.Contains("i3") ||
                            mensajeUsuario.Contains("i5") ||
                            mensajeUsuario.Contains("i7") ||
                            mensajeUsuario.Contains("i9")
                        )
                        {
                            categoriaBuscada = "CPU";
                        }

                        IEnumerable<Componente> alternativas = todosLosComponentes;

                        if (categoriaBuscada != null)
                        {
                            alternativas = alternativas.Where(c =>
                                c.Tipo.ToString() == categoriaBuscada);
                        }

                        var alternativasFinal = alternativas
                            .OrderBy(c => c.Precio)
                            .Take(5)
                            .ToList();

                        return Ok(new
                        {
                            texto =
                                "No tengo ese modelo exacto en inventario actualmente.\n\n" +
                                "Pero tengo estas alternativas disponibles:\n\n" +
                                string.Join("\n", alternativasFinal.Select(c =>
                                    $"- {c.Nombre} | Precio: ${c.Precio} | Socket: {c.Socket ?? "N/A"} | RAM: {c.TipoMemoria ?? "N/A"}"
                                )),

                            opciones = alternativasFinal
                                .Select(c => c.Nombre)
                                .ToList()
                        });
                    }
                }
                                
                // C. Búsqueda por Marca + Categoría 
                else if (
                    categoriaBuscada != null &&
                    marcaBuscada != null &&
                    esConsultaDisponibilidad &&
                    !esPreguntaEducativa
                )
                {
                    var inventario = await ConsultarInventarioInterno(
                        categoriaBuscada,
                        marcaBuscada,
                        socketBuscado,
                        ramBuscada);

                    if (inventario == "SIN STOCK" || inventario == "Categoría no reconocida.")
                    {
                        return Ok(new
                        {
                            texto = $"No encontré componentes {marcaBuscada} disponibles en esa categoría.",
                            opciones = new List<string>()
                        });
                    }

                    return Ok(new
                    {
                        texto =
                            $"Actualmente tengo estos componentes {marcaBuscada} disponibles:\n\n" +
                            inventario,
                        opciones = new List<string>()
                    });
                }

                // --- Compatibilidad DDR explícita con Motherboard --- //
                else if (
                    !esPreguntaEducativa &&
                    componenteAncla != null &&
                    componenteAncla.Tipo == TipoComponente.PlacaBase &&
                    !string.IsNullOrWhiteSpace(ramBuscada) &&
                    (
                        mensajeUsuario.Contains("sirve") ||
                        mensajeUsuario.Contains("compatible") ||
                        mensajeUsuario.Contains("soporta") ||
                        mensajeUsuario.Contains("funciona")
                    )
                )
                {
                    bool compatible =
                        componenteAncla.TipoMemoria != null &&
                        componenteAncla.TipoMemoria.Trim().ToUpper() ==
                        ramBuscada.Trim().ToUpper();

                    return Ok(new
                    {
                        texto = compatible
                            ? $"Sí, la {componenteAncla.Nombre} soporta memoria {ramBuscada}."
                            : $"No, la {componenteAncla.Nombre} no soporta {ramBuscada}. Esta motherboard utiliza memoria {componenteAncla.TipoMemoria}.",

                        opciones = new List<string>()
                    });
                }

                // D. Compatibilidad Ancla + Categoría 
                else if (
                    esDudaCompatibilidad &&
                    !preguntaCompatibilidadDirecta &&
                    componenteAncla != null &&
                    categoriaBuscada != null &&
                    !esPreguntaEducativa
                )
                {
                    var candidatos = todosLosComponentes
                        .Where(c =>
                            c.Tipo.ToString().Equals(
                                categoriaBuscada,
                                StringComparison.OrdinalIgnoreCase))
                        .ToList();

                    var compatibles =
                        _buildCompatibilityService
                            .FiltrarCompatibles(
                                componenteAncla,
                                candidatos);

                    if (compatibles.Any())
                    {
                        return Ok(new
                        {
                            texto =
                                $"Componentes compatibles con {componenteAncla.Nombre}:\n\n" +
                                string.Join("\n",
                                    compatibles.Select(c =>
                                        $"- {c.Nombre} | Tipo: {c.Tipo} | Precio: ${c.Precio} | Socket: {c.Socket ?? "N/A"}"
                                    )),

                            opciones = compatibles
                                .Select(c => c.Nombre)
                                .Take(5)
                                .ToList()
                        });
                    }

                    return Ok(new
                    {
                        texto = $"No encontré componentes compatibles con {componenteAncla.Nombre} en esa categoría.",
                        opciones = new List<string>()
                    });
                }

                // E. Categoría sola / disponibilidad en inventario (Exploración) 
                else if (
                    categoriaBuscada != null &&
                    esConsultaDisponibilidad &&
                    !esPreguntaEducativa
                )
                {
                    var inventario =
                        await ConsultarInventarioInterno(
                            categoriaBuscada,
                            marcaBuscada,
                            socketBuscado,
                            ramBuscada);

                    if (
                        inventario == "SIN STOCK" ||
                        inventario == "Categoría no reconocida.")
                    {
                        return Ok(new
                        {
                            texto = "Actualmente no tengo componentes disponibles de esa categoría.",
                            opciones = new List<string>()
                        });
                    }

                    string categoriaTexto = categoriaBuscada switch
                    {
                        "PlacaBase" => "motherboards",
                        "CPU" => "procesadores",
                        "MemoriaRAM" => "memorias RAM",
                        "GPU" => "tarjetas gráficas",
                        "FuentePoder" => "fuentes de poder",
                        "Gabinete" => "gabinetes",
                        "Refrigeracion" => "sistemas de refrigeración",
                        "Almacenamiento" => "unidades de almacenamiento",
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
                    "- Cuando menciones productos, usa únicamente componentes del inventario.\n" +
                    "- Las opciones que des de componentes después de dar una explicación o definición técnica que sea con base al inventario preciso de ArmatuXPC.\n" +
                    "- No digas madreboad para referirte a la motherboard, dilo tal como debe ser: motherboard, tarjeta madre o placa madre\n\n" +

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
            {
                query = query.Where(c =>
                    EF.Functions.ILike(c.Marca, $"%{marca}%") ||
                    EF.Functions.ILike(c.Nombre, $"%{marca}%") ||
                    EF.Functions.ILike(c.Modelo, $"%{marca}%") ||

                    // AMD: permitir Ryzen aunque la marca no venga escrita como AMD
                    (marca == "AMD" &&
                        (EF.Functions.ILike(c.Nombre, "%Ryzen%") ||
                        EF.Functions.ILike(c.Modelo, "%Ryzen%"))) ||

                    (marca == "Intel" &&
                        (EF.Functions.ILike(c.Nombre, "%Core%") ||
                        EF.Functions.ILike(c.Modelo, "%Core%"))) 
                    
                );
            }
            
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

            // Listado de componentes (consulta SQL)
            var componentes = await query
                .OrderBy(c => c.Nombre)
                .Take(10)
                .ToListAsync();
            
            // Valida si hay componentes
            if (!componentes.Any())
                return "SIN STOCK";

            // Filtrado de detalles de cada tipo de componente de manera limpia
            var lineas = componentes.Select(c =>
            {
                string energiaTexto =
                    c.Tipo == TipoComponente.FuentePoder
                        ? $"Capacidad: {c.CapacidadWatts ?? 0}W"
                        : $"Consumo: {c.ConsumoWatts ?? 0}W";

                string detalles = c.Tipo switch
                {
                    TipoComponente.CPU =>
                        $"Socket: {c.Socket}",

                    TipoComponente.PlacaBase =>
                        $"Socket: {c.Socket} | RAM: {c.TipoMemoria}",

                    TipoComponente.MemoriaRAM =>
                        $"Tipo: {c.TipoMemoria}",

                    TipoComponente.GPU =>
                        energiaTexto,

                    TipoComponente.FuentePoder =>
                        energiaTexto,

                    _ => energiaTexto
                };

                return
                    $"- {c.Nombre} | " +
                    $"Precio: ${c.Precio} | " +
                    detalles;
            });

            return string.Join("\n", lineas);
        }

        // Método auxiliar para detección inteligente de categorías de componentes
        private static string? DetectarCategoriaBuscada(string mensaje)
        {
            mensaje = mensaje.ToLower();

            if (
                mensaje.Contains("placa") ||
                mensaje.Contains("placas") ||
                mensaje.Contains("motherboard") ||
                mensaje.Contains("motherboards") ||
                mensaje.Contains("tarjeta madre") ||
                mensaje.Contains("tarjetas madre") ||
                mensaje.Contains("mobo")
            )
                return "PlacaBase";

            if (
                mensaje.Contains("procesador") ||
                mensaje.Contains("procesadores") ||
                mensaje.Contains("cpu") ||
                mensaje.Contains("cpus")
            )
                return "CPU";

            if (
                mensaje.Contains("memoria ram") ||
                mensaje.Contains("memorias ram") ||
                mensaje.Contains("ram") ||
                mensaje.Contains("rams") ||
                mensaje.Contains("ddr4") ||
                mensaje.Contains("ddr5")
            )
                return "MemoriaRAM";

            if (
                mensaje.Contains("tarjeta gráfica") ||
                mensaje.Contains("tarjetas gráficas") ||
                mensaje.Contains("tarjeta grafica") ||
                mensaje.Contains("tarjetas graficas") ||
                mensaje.Contains("gpu") ||
                mensaje.Contains("gpus") ||
                mensaje.Contains("video") ||
                mensaje.Contains("gráfica") ||
                mensaje.Contains("grafica")
            )
                return "GPU";

            if (
                mensaje.Contains("disco") ||
                mensaje.Contains("discos") ||
                mensaje.Contains("ssd") ||
                mensaje.Contains("hdd") ||
                mensaje.Contains("nvme") ||
                mensaje.Contains("m.2") ||
                mensaje.Contains("almacenamiento")
            )
                return "Almacenamiento";

            if (
                mensaje.Contains("fuente") ||
                mensaje.Contains("fuentes") ||
                mensaje.Contains("psu") ||
                mensaje.Contains("poder") ||
                mensaje.Contains("fuente de poder")
            )
                return "FuentePoder";

            if (
                mensaje.Contains("refrigeración") ||
                mensaje.Contains("refrigeracion") ||
                mensaje.Contains("cooler") ||
                mensaje.Contains("coolers") ||
                mensaje.Contains("ventilador") ||
                mensaje.Contains("ventiladores") ||
                mensaje.Contains("disipador") ||
                mensaje.Contains("disipadores")
            )
                return "Refrigeracion";

            if (
                mensaje.Contains("caja") ||
                mensaje.Contains("cajas") ||
                mensaje.Contains("gabinete") ||
                mensaje.Contains("gabinetes") ||
                mensaje.Contains("case") ||
                mensaje.Contains("cases")
            )
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

            // PRIORIDAD MÁXIMA:
            // coincidencia exacta por modelo
            var exactosPorModelo = componentes
                .Where(c =>
                    !string.IsNullOrWhiteSpace(c.Modelo) &&
                    texto.Contains(Normalizar(c.Modelo)))
                .ToList();

            if (exactosPorModelo.Any())
            {
                return exactosPorModelo
                    .DistinctBy(c => c.ComponenteId)
                    .ToList();
            }

            // Búsqueda exacta de compoenente y su capacidad (P.ej: 16GB, 32GB)
            var exactos = componentes
                .Where(c => texto.Contains(Normalizar(c.Nombre)))
                .OrderByDescending(c => c.Nombre.Length)
                .ToList();

            resultados.AddRange(exactos);

            string? ddrDetectado = null;

            if (texto.Contains("ddr5"))
                ddrDetectado = "DDR5";

            if (texto.Contains("ddr4"))
                ddrDetectado = "DDR4";

            foreach (var componente in componentes)
            {
                // Detectar capacidad escrita por el usuario: 16GB, 32GB, etc.
                string? capacidadDetectada = null;

                var matchCapacidad = System.Text.RegularExpressions.Regex.Match(
                    texto,
                    @"\b\d+\s*gb\b"
                );

                if (matchCapacidad.Success)
                {
                    capacidadDetectada = matchCapacidad.Value.Replace(" ", "");
                }
                
                // VALIDACIÓN DDR ANTES DE TODO
                if (
                    componente.Tipo == TipoComponente.MemoriaRAM &&
                    ddrDetectado != null
                )
                {
                    if (
                        string.IsNullOrWhiteSpace(componente.TipoMemoria) ||
                        componente.TipoMemoria.ToUpper() != ddrDetectado.ToUpper()
                    )
                    {
                        continue;
                    }
                }

                var nombre = Normalizar(componente.Nombre);

                // Si el usuario escribió 32GB, 16GB, etc.,
                // no permitas que entre una RAM con otra capacidad.
                if (
                    componente.Tipo == TipoComponente.MemoriaRAM &&
                    capacidadDetectada != null
                )
                {
                    var nombreNormalizado = Normalizar(componente.Nombre).Replace(" ", "");
                    var modeloNormalizado = Normalizar(componente.Modelo ?? "").Replace(" ", "");

                    if (
                        !nombreNormalizado.Contains(capacidadDetectada.ToLower()) &&
                        !modeloNormalizado.Contains(capacidadDetectada.ToLower())
                    )
                    {
                        continue;
                    }
                }

                var palabrasNombre = nombre
                    .Split(' ')
                    .Where(p => !stopWords.Contains(p))
                    .ToList();

                int coincidencias =
                    palabrasNombre.Count(p => texto.Contains(p));
                
                var modelo = Normalizar(componente.Modelo ?? "");
                var chipset = Normalizar(componente.Chipset ?? "");

                bool esMotherboardPorModelo =
                    componente.Tipo == TipoComponente.PlacaBase &&
                    !string.IsNullOrWhiteSpace(modelo) &&
                    texto.Contains(modelo);

                bool esMotherboardPorChipsetYMarca =
                    componente.Tipo == TipoComponente.PlacaBase &&
                    !string.IsNullOrWhiteSpace(chipset) &&
                    texto.Contains(chipset) &&
                    texto.Contains(Normalizar(componente.Marca ?? ""));

                bool esCpuIntelCore =
                    componente.Tipo == TipoComponente.CPU &&
                    texto.Contains("intel") &&
                    (
                        texto.Contains(Normalizar(componente.Nombre)) ||
                        texto.Contains(Normalizar(componente.Modelo ?? ""))
                    );

                bool matchPorPalabras =
                    palabrasNombre.Count >= 3 &&
                    coincidencias >= Math.Min(3, palabrasNombre.Count);

                bool match =
                    esCpuIntelCore ||
                    esMotherboardPorModelo ||
                    esMotherboardPorChipsetYMarca ||
                    matchPorPalabras ||
                    (!string.IsNullOrWhiteSpace(modelo) && texto.Contains(modelo)) ||
                    texto.Contains(nombre);

                if (match)
                {
                    resultados.Add(componente);
                }
            }

            return resultados
                .DistinctBy(c => c.ComponenteId)
                .OrderBy(c => c.Tipo == TipoComponente.CPU ? 0 :
                            c.Tipo == TipoComponente.PlacaBase ? 1 :
                            c.Tipo == TipoComponente.MemoriaRAM ? 2 : 3)
                .ThenByDescending(c => Normalizar(c.Nombre).Length)
                .ToList();
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

        private List<Componente> DetectarComponenteSoloHistorial(
            List<Componente> componentes,
            List<MensajeChat>? historial)
        {
            if (historial == null)
                return new List<Componente>();

            foreach (var msg in historial.AsEnumerable().Reverse())
            {
                var encontrados =
                    BuscarComponenteFlexible(
                        componentes,
                        msg.Contenido);

                if (encontrados.Any())
                    return encontrados;
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
