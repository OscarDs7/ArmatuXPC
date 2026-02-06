using System.Text.Json.Serialization; // For JsonStringEnumConverter

namespace ArmatuXPC.Backend.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TipoComponente
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