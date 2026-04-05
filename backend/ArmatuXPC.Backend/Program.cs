using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using System.Text.Json.Serialization;
using ArmatuXPC.Backend.Services.Armados;
using Google.Cloud.Firestore;
using Stripe;

// 1. Cargar el archivo .env ANTES de cualquier otra cosa
Env.Load(); 

var builder = WebApplication.CreateBuilder(args);

// 2. FORZAR a builder.Configuration a reconocer las variables que acabamos de cargar en el Environment
builder.Configuration.AddEnvironmentVariables();

// 3. Intentar obtener la clave (Probamos ambas formas por seguridad)
var stripeSecretKey = builder.Configuration["Stripe:SecretKey"] 
                      ?? Environment.GetEnvironmentVariable("Stripe__SecretKey");

// 4. VALIDAR Y ASIGNAR
if (!string.IsNullOrEmpty(stripeSecretKey))
{
    StripeConfiguration.ApiKey = stripeSecretKey;
    // Log para confirmar en consola que ya no es nulo
    Console.WriteLine("✅ Stripe__SecretKey se ha leído correctamente.");}
else
{
    Console.WriteLine("❌ ERROR: Stripe__SecretKey sigue sin leerse. Revisa la ubicación del .env, debe esta en la raíz del proyecto backend/ArmatuXPC.Backend/. También verifica que la variable esté nombrada exactamente como 'Stripe__SecretKey' y que el archivo .env se esté cargando correctamente.");
}

// --- CONFIGURACIÓN DE FIREBASE ---
string rutaFirebase = Path.Combine(Directory.GetCurrentDirectory(), "firebase-adminsdk.json");
Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", rutaFirebase);

builder.Services.AddSingleton(s => {
    // Asegúrate de que el ProjectId coincida con tu consola de Firebase
    return FirestoreDb.Create("armatuxpc");
});

// --- CONFIGURACIÓN DE BASE DE DATOS ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");


// --- SERVICIOS BASE ---
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- SERVICIOS DE NEGOCIO ---
builder.Services.AddScoped<IArmadoValidationService, ArmadoValidationService>();
builder.Services.AddScoped<IArmadoEnergiaService, ArmadoEnergiaService>();

// --- BASE DE DATOS (PostgreSQL) ---
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// --- CORS ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// --- PIPELINE HTTP ---
app.UseCors("AllowReact");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ArmatuXPC.Backend v1"));
}

//app.UseHttpsRedirection();
app.UseAuthorization(); // Añade esto si planeas usar [Authorize] en el futuro
app.MapControllers();

app.Run();