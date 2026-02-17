namespace ArmatuXPC.Backend.DTOs.Armados
{
    public class ArmadoResumenDto
    {
        public int ArmadoId { get; set; }

        public decimal ConsumoTotalWatts { get; set; }

        public decimal? CapacidadFuenteWatts { get; set; }

        public bool FuenteSuficiente { get; set; }

        public decimal MargenRecomendadoWatts { get; set; }
    }
}
