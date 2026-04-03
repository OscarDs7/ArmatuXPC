// Código para mandar el objeto de recarga desde el frontend al backend, y que el backend actualice los tokens del usuario en Firestore.

namespace ArmatuXPC.Backend.DTOs
{
    public class RecargaRequest
    {
        public string? PaymentId { get; set; } // Opcional por ahora
        public string UsuarioUid { get; set; } = string.Empty;
        public int CantidadComprada { get; set; }
    }
}