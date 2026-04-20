// Código para mandar el objeto de recarga desde el frontend al backend, y que el backend actualice los tokens del usuario en Firestore.

namespace ArmatuXPC.Backend.DTOs
{
    public class RecargaRequest
    {
        public string UsuarioUid { get; set; } = string.Empty; // UID del usuario en Firebase
        public int CantidadComprada { get; set; } // Cantidad de tokens que el usuario compró (ej: 3, 10, 100)
        public long PrecioCentavos { get; set; } // Stripe maneja centavos (ej: 49.00 MXN = 4900)

    }
}