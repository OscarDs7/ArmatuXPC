namespace ArmatuXPC.Backend.DTOs.Armados
{   
    public class ArmadoRecommendationDto
    {
        public int ReplaceComponentId { get; set; } // Id del componente que se recomienda reemplazar
        public string ReplaceComponentName { get; set; } = string.Empty; // Nombre del componente que se recomienda reemplazar
        public List<RecommendedComponentDto> Suggestions { get; set; } = new(); // Lista de componentes recomendados como reemplazo
    }
}
