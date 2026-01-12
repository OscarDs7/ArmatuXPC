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
                    .WithMany(c => c.ComoGabinete)
                    .HasForeignKey(a => a.GabineteId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.PlacaBase)
                    .WithMany(c => c.ComoPlacaBase)
                    .HasForeignKey(a => a.PlacaBaseId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.FuentePoder)
                    .WithMany(c => c.ComoFuentePoder)
                    .HasForeignKey(a => a.FuentePoderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.MemoriaRam)
                    .WithMany(c => c.ComoMemoriaRam)
                    .HasForeignKey(a => a.MemoriaRamId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Procesador)
                    .WithMany(c => c.ComoProcesador)
                    .HasForeignKey(a => a.ProcesadorId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.Almacenamiento)
                    .WithMany(c => c.ComoAlmacenamiento)
                    .HasForeignKey(a => a.AlmacenamientoId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(a => a.GPU)
                    .WithMany(c => c.ComoGPU)
                    .HasForeignKey(a => a.GPUId)
                    .OnDelete(DeleteBehavior.Restrict);
            }); // Configuración específica para la entidad Armado

            modelBuilder.Entity<Compatibilidad>()
                .HasOne(c => c.ComponenteA)
                .WithMany()
                .HasForeignKey(c => c.ComponenteAId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Compatibilidad>()
                .HasOne(c => c.ComponenteB)
                .WithMany()
                .HasForeignKey(c => c.ComponenteBId)
                .OnDelete(DeleteBehavior.Restrict);
                
            } // fin de OnModelCreating

    } // fin de AppDbContext

} // fin de namespace ArmatuXPC.Backend.Data
