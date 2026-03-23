using ArmatuXPC.Backend.Models;
using ArmatuXPC.Backend.Data;

namespace ArmatuXPC.Backend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Asegura que la base de datos exista
            context.Database.EnsureCreated();

            // Si ya hay componentes, no hacemos nada
            if (context.Componentes.Any()) return;

            var componentes = new List<Componente>
            {
                new Componente { Nombre = "AMD Ryzen 5 5600X", Marca = "AMD", Modelo = "5600X", Precio = 190.00m, Tipo = TipoComponente.CPU, ConsumoWatts = 65 },
                new Componente { Nombre = "NVIDIA RTX 3060", Marca = "ASUS", Modelo = "Dual OC", Precio = 350.00m, Tipo = TipoComponente.GPU, ConsumoWatts = 170 },
                new Componente { Nombre = "B550M Motherboard", Marca = "Gigabyte", Modelo = "DS3H", Precio = 110.00m, Tipo = TipoComponente.PlacaBase, ConsumoWatts = 50 },
                new Componente { Nombre = "16GB DDR4 3200MHz", Marca = "Corsair", Modelo = "Vengeance LPX", Precio = 60.00m, Tipo = TipoComponente.MemoriaRAM, ConsumoWatts = 10 },
                new Componente { Nombre = "EVGA 600W 80+", Marca = "EVGA", Modelo = "600 W1", Precio = 55.00m, Tipo = TipoComponente.FuentePoder, CapacidadWatts = 600 }
            };

            context.Componentes.AddRange(componentes);
            context.SaveChanges();
        }
    }
}