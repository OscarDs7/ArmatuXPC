using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;

namespace ArmatuXPC.Backend.Controllers
{
    [ApiController]
    [Route("api/chatbot")]
    public class ChatbotController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public ChatbotController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient("OllamaClient");
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ChatRequest request)
        {
           // Simplificamos la instrucción para que sea una orden directa, no una descripción
           string systemInstruction = "Eres el asistente técnico de ArmatuXPC. Tu objetivo es ayudar a armar PCs. Responde de forma amable, breve y siempre en español.";

            // Construimos el payload para Ollama, incluyendo el contexto del sistema
            var payload = new
            {
                model = "llama3.2",
                // El formato exacto que Llama 3.2 reconoce:
                prompt = $"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{systemInstruction}<|eot_id|>" +
                        $"<|start_header_id|>user<|end_header_id|>\n\n{request.Mensaje}<|eot_id|>" +
                        $"<|start_header_id|>assistant<|end_header_id|>\n\n",
                options = new {
                    temperature = 0.5, // Un poco más de calidez
                    num_predict = 200,
                    // Esto es CLAVE: Evita que el modelo siga escribiendo etiquetas
                    stop = new[] { "<|eot_id|>", "<|start_header_id|>", "Usuario:" }
                },
                stream = true
            };

            var response = await _httpClient.PostAsJsonAsync("/api/generate", payload);

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, "Error al comunicarse con Ollama");
            
            // Leer la respuesta como string directamente para evitar problemas de deserialización
            using var stream = await response.Content.ReadAsStreamAsync();
            using var reader = new StreamReader(stream);

            var finalText = new StringBuilder(); // Usamos StringBuilder para construir la respuesta completa

            var result = await response.Content.ReadAsStringAsync();

            while (!reader.EndOfStream)
            {
                var line = await reader.ReadLineAsync();
                if (string.IsNullOrWhiteSpace(line)) continue;

                    try
                    {
                        using var doc = JsonDocument.Parse(line);
                        if (doc.RootElement.TryGetProperty("response", out var resp))
                        {
                            finalText.Append(resp.GetString());
                        }
                    }
                    catch (JsonException)
                    {
                        // Ignorar líneas que no sean JSON válido
                    }
            }

                return Ok(new { texto = finalText.ToString() });
        }
    }

    public class ChatRequest
    {
        public required string Mensaje { get; set; }
    }
}
