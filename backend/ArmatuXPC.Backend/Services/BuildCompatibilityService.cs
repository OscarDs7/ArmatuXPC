using ArmatuXPC.Backend.Models;

namespace ArmatuXPC.Backend.Services
{
    public class BuildCompatibilityService
    {
        // CPU ↔ Motherboard
        public bool CPUCompatibleMotherboard(
            Componente? cpu,
            Componente? motherboard)
        {
            if (cpu == null || motherboard == null)
                return false;

            if (string.IsNullOrWhiteSpace(cpu.Socket) ||
                string.IsNullOrWhiteSpace(motherboard.Socket))
                return false;

            return cpu.Socket.Trim().ToUpper() ==
                   motherboard.Socket.Trim().ToUpper();
        }

        // RAM ↔ Motherboard
        public bool RAMCompatibleMotherboard(
            Componente? ram,
            Componente? motherboard)
        {
            if (ram == null || motherboard == null)
                return false;

            if (string.IsNullOrWhiteSpace(ram.TipoMemoria) ||
                string.IsNullOrWhiteSpace(motherboard.TipoMemoria))
                return false;

            return ram.TipoMemoria.Trim().ToUpper() ==
                   motherboard.TipoMemoria.Trim().ToUpper();
        }

        // PSU suficiente
        public bool FuenteSuficiente(
            Componente? fuente,
            BuildPC build)
        {
            if (fuente == null)
                return false;

            if (fuente.CapacidadWatts == null)
                return false;

            return fuente.CapacidadWatts >=
                   (build.ConsumoTotal * 1.3m);
        }

        // Validación completa
        public List<string> ValidarBuild(BuildPC build)
        {
            var errores = new List<string>();

            // CPU + Motherboard
            if (build.CPU != null &&
                build.Motherboard != null)
            {
                if (!CPUCompatibleMotherboard(
                    build.CPU,
                    build.Motherboard))
                {
                    errores.Add(
                        "CPU y motherboard no comparten socket.");
                }
            }

            // RAM + Motherboard
            if (build.RAM != null &&
                build.Motherboard != null)
            {
                if (!RAMCompatibleMotherboard(
                    build.RAM,
                    build.Motherboard))
                {
                    errores.Add(
                        "RAM y motherboard no usan el mismo tipo DDR.");
                }
            }

            // PSU
            if (build.PSU != null)
            {
                if (!FuenteSuficiente(
                    build.PSU,
                    build))
                {
                    errores.Add(
                        "La fuente de poder no tiene suficientes watts.");
                }
            }

            return errores;
        }

        // Obtener compatibles genéricamente
        public List<Componente> FiltrarCompatibles(
            Componente origen,
            List<Componente> candidatos)
        {
            var compatibles = new List<Componente>();

            foreach (var candidato in candidatos)
            {
                bool esCompatible = false;

                // CPU -> Motherboard
                if (
                    origen.Tipo == TipoComponente.CPU &&
                    candidato.Tipo == TipoComponente.PlacaBase
                )
                {
                    esCompatible =
                        CPUCompatibleMotherboard(
                            origen,
                            candidato);
                }

                // Motherboard -> CPU
                else if (
                    origen.Tipo == TipoComponente.PlacaBase &&
                    candidato.Tipo == TipoComponente.CPU
                )
                {
                    esCompatible =
                        CPUCompatibleMotherboard(
                            candidato,
                            origen);
                }

                // Motherboard -> RAM
                else if (
                    origen.Tipo == TipoComponente.PlacaBase &&
                    candidato.Tipo == TipoComponente.MemoriaRAM
                )
                {
                    esCompatible =
                        RAMCompatibleMotherboard(
                            candidato,
                            origen);
                }

                // RAM -> Motherboard
                else if (
                    origen.Tipo == TipoComponente.MemoriaRAM &&
                    candidato.Tipo == TipoComponente.PlacaBase
                )
                {
                    esCompatible =
                        RAMCompatibleMotherboard(
                            origen,
                            candidato);
                }

                if (esCompatible)
                {
                    compatibles.Add(candidato);
                }
            }

            return compatibles;
        }
    }
}