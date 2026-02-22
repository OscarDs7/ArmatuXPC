using System.Text.Json.Serialization; // For JsonStringEnumConverter

namespace ArmatuXPC.Backend.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))] // Convierte el enum a string en JSON para una mejor legibilidad
    public enum TipoComponente // Enum para representar los tipos de componentes de PC
    {
        CPU = 1,
        GPU = 2,
        MemoriaRAM = 3,
        Almacenamiento = 4,
        FuentePoder = 5,
        PlacaBase = 6,
        Gabinete = 7
    }
}