namespace ArmatuXPC.Backend.Models
{
    public class Componente
    {
        public int ComponenteId { get; set; }

        public string Nombre { get; set; } = string.Empty;
        public string Marca { get; set; } = string.Empty;
        public string Modelo { get; set; } = string.Empty;
        public int Tipo { get; set; }
        public decimal Voltaje { get; set; }
    }
}
