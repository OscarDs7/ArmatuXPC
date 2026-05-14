// Servicio que aloja la configuración del modelo de Ollama para separación de partes del Chatbot

using System.Text.Json;

namespace ArmatuXPC.Backend.Services
{
    public class OllamaService
    {
        private readonly HttpClient _httpClient;

        public OllamaService(
            IHttpClientFactory httpClientFactory)
        {
            _httpClient =
                httpClientFactory.CreateClient("OllamaClient");
        }

        public async Task<string> GenerarRespuesta(
            string prompt)
        {
            var payload = new
            {
                model = "llama3.2",
                prompt = prompt,
                stream = false,
                options = new
                {
                    temperature = 0.05,
                    num_predict = 350,
                    top_p = 0.9,
                    stop = new[]
                    {
                        "<|eot_id|>",
                        "<|start_header_id|>"
                    }
                }
            };

            var response =
                await _httpClient.PostAsJsonAsync(
                    "/api/generate",
                    payload);

            response.EnsureSuccessStatusCode();

            var json =
                await response.Content
                    .ReadFromJsonAsync<JsonElement>();

            return json
                .GetProperty("response")
                .GetString() ?? "";
        }
    }
}