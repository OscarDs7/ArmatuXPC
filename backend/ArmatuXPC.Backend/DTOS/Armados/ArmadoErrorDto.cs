namespace ArmatuXPC.Backend.DTOs.Armados
{   
    public class ArmadoErrorDto
    {
        public int ComponenteAId { get; set; } // Id del componente que genera el error
        public int ComponenteBId { get; set; } // Id del componente afectado por el error
        public string Motivo { get; set; } = string.Empty; // Descripción del error
    }
}
