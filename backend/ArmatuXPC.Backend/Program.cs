using ArmatuXPC.Backend.Data;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

Env.Load(); // Cargar variables de entorno desde el archivo .env

var builder = WebApplication.CreateBuilder(args); // Crear el constructor de la aplicación

// Controllers
builder.Services.AddControllers();

// Swagger / OpenAPI (estable)
builder.Services.AddEndpointsApiExplorer(); // Explorador de puntos finales API
builder.Services.AddSwaggerGen(); // Generador de Swagger

// EF Core + PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

var app = builder.Build(); // Construir la aplicación

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
