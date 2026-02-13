using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;
using System.Text.Json.Serialization;
using ArmatuXPC.Backend.Services.Armados;


Env.Load(); // Cargar variables de entorno desde el archivo .env

var builder = WebApplication.CreateBuilder(args); // Crear el constructor de la aplicación

// Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Configurar el convertidor de enumeraciones a cadenas JSON
        options.JsonSerializerOptions.Converters.Add(
            new JsonStringEnumConverter());
    });

// Swagger / OpenAPI (estable)
builder.Services.AddEndpointsApiExplorer(); // Explorador de puntos finales API
builder.Services.AddSwaggerGen(); // Generador de Swagger

// Servicios personalizados de lógica de negocio
builder.Services.AddScoped<IArmadoValidationService, ArmadoValidationService>();

// EF Core + PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Configuración de CORS para permitir solicitudes desde el frontend React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact",
        policy =>
        {
            policy.WithOrigins("http://localhost:3000") 
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build(); // Construir la aplicación

app.UseCors("AllowReact"); // Habilitar CORS con la política definida

// Pipeline HTTP
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ArmatuXPC.Backend v1");
});

app.UseHttpsRedirection(); // Redirección HTTPS

// Map Controllers
app.MapControllers();


app.Run(); // Ejecutar la aplicación
