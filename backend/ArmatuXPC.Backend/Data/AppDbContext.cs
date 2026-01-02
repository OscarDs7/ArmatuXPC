using Microsoft.EntityFrameworkCore;
using ArmatuXPC.Backend.Models;

namespace ArmatuXPC.Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        // DbSets (tablas)
        public DbSet<Componente> Componentes { get; set; }
        public DbSet<Armado> Armados { get; set; }
        public DbSet<Compatibilidad> Compatibilidades { get; set; } 
    }
}
