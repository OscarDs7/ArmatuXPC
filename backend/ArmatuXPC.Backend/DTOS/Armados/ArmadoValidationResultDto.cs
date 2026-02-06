namespace ArmatuXPC.Backend.DTOs.Armados
{   
    public class ArmadoValidationResultDto
    {
        public int ArmadoId { get; set; }
        public bool IsValid { get; set; }
        public List<ArmadoErrorDto> Errors { get; set; } = new();
        public List<ArmadoRecommendationDto> Recommendations { get; set; } = new();
    }
}
