namespace ArmatuXPC.Backend.Models
{
    public class Armado
    {
        public int ArmadoId { get; set; } 
        public int UsuarioId { get; set; }
        public string NombreArmado { get; set; } = string.Empty;
        public int GabineteId { get; set; }
        public int PlacaBaseId { get; set; }
        public int FuentePoderId { get; set; }
        public int MemoriaRamId { get; set; }
        public int ProcesadorId { get; set; }
        public int AlmacenamientoId { get; set; }
        public int GPUId { get; set; }
    }
}
