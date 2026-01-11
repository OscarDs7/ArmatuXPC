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

        // Configuración de las relaciones entre entidades o tablas
        protected override void OnModelCreating(ModelBuilder modelBuilder)
{
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Armado>(entity =>
            {
                entity.HasOne(a => a.Gabinete)
                    .WithMany()
                    .HasForeignKey(a => a.GabineteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.PlacaBase)
                    .WithMany()
                    .HasForeignKey(a => a.PlacaBaseId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.FuentePoder)
                    .WithMany()
                    .HasForeignKey(a => a.FuentePoderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.MemoriaRam)
                    .WithMany()
                    .HasForeignKey(a => a.MemoriaRamId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Procesador)
                    .WithMany()
                    .HasForeignKey(a => a.ProcesadorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Almacenamiento)
                    .WithMany()
                    .HasForeignKey(a => a.AlmacenamientoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.GPU)
                    .WithMany()
                    .HasForeignKey(a => a.GPUId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }


    }
}
