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
        public DbSet<ArmadoComponente> ArmadoComponentes { get; set; } // Tabla de unión para relación muchos a muchos entre Armado y Componente

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =========================
            // ARMADO - COMPONENTE (Many to Many)
            // =========================
            modelBuilder.Entity<ArmadoComponente>()
                .HasKey(ac => new { ac.ArmadoId, ac.ComponenteId });

            modelBuilder.Entity<ArmadoComponente>()
                .HasOne(ac => ac.Armado)
                .WithMany(a => a.Componentes)
                .HasForeignKey(ac => ac.ArmadoId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ArmadoComponente>()
                .HasOne(ac => ac.Componente)
                .WithMany(c => c.Armados)
                .HasForeignKey(ac => ac.ComponenteId)
                .OnDelete(DeleteBehavior.Restrict);

            // =========================
            // COMPATIBILIDAD
            // =========================
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
        }
    }
}
