public class FeedbackUsuario
{
    public int Id { get; set; }
    public string UsuarioUid { get; set; } = string.Empty; // El UID de Firebase
    public int Rating { get; set; } // 0 para el primer armado, 1-5 para el tercero
    public string Comentario { get; set; } = string.Empty;
    public string TipoHito { get; set; } = string.Empty; // "PRIMER_ARMADO" o "TERCER_ARMADO"
   // 💡 Cambio clave: Forzar DateTime.UtcNow para compatibilidad con Postgres
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public bool? CompletoSinAyuda { get; set; } // para conocer más a fondo experiencia de usuario en su primer armado
}