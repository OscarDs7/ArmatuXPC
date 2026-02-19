namespace ArmatuXPC.Backend.DTOs.Armados
{
    public class RecommendedComponentDto
    {
        public int Id { get; set; } // Id del componente recomendado
        public string Nombre { get; set; } = string.Empty; // Nombre del componente recomendado
        public string Marca { get; set; } = string.Empty; // Marca del componente recomendado
        public string Modelo { get; set; } = string.Empty; // Modelo del componente recomendado
        public decimal Precio { get; set; } // Precio del componente recomendado
    }
}