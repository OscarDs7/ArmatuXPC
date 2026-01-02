namespace ArmatuXPC.Backend.Models
{
    public class Componente
    {
        public int ComponenteId { get; set; } 
        public string Nombre { get; set; } = string.Empty; // Ejemplo: "Intel Core i7-9700K"
        public string Marca { get; set; } = string.Empty; // Ejemplo: "Intel", "AMD", "NVIDIA"
        public string Modelo { get; set; } = string.Empty; // Ejemplo: "i7-9700K", "RX 580"
        public int Tipo { get; set; } // Ejemplo: CPU = 1, GPU = 2, RAM = 3, etc.
        public decimal Voltaje { get; set; } // En milivoltios (mV)
    }
}
