using System.Linq;

namespace ArmatuXPC.Backend.Models
{
    public class BuildPC
    {
        public Componente? CPU { get; set; }

        public Componente? Motherboard { get; set; }

        public Componente? RAM { get; set; }

        public Componente? GPU { get; set; }

        public Componente? PSU { get; set; }

        public Componente? Gabinete { get; set; }

        public Componente? Almacenamiento { get; set; }

        public decimal Presupuesto { get; set; }

        // Precio total automático
        public decimal Total =>
            (CPU?.Precio ?? 0m) +
            (Motherboard?.Precio ?? 0m) +
            (RAM?.Precio ?? 0m) +
            (GPU?.Precio ?? 0m) +
            (PSU?.Precio ?? 0m) +
            (Gabinete?.Precio ?? 0m) +
            (Almacenamiento?.Precio ?? 0m);

        // Consumo total automático
        public decimal ConsumoTotal =>
            (CPU?.ConsumoWatts ?? 0m) +
            (GPU?.ConsumoWatts ?? 0m) +
            (Motherboard?.ConsumoWatts ?? 0m) +
            (RAM?.ConsumoWatts ?? 0m) +
            80m; // margen general
    }
}