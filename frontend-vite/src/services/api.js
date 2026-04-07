// src/services/api.js
// Servicio para interactuar con el backend desde el frontend.
// Este archivo define funciones para realizar solicitudes HTTP al backend, como obtener la lista de componentes, armados y compatibilidades, así como agregar un nuevo componente a la base de datos u otras funciones. 

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://10.191.176.243:5000/api";

export const getComponentes = async () => {
  const response = await fetch(`${API_URL}/Componentes`);
  if (!response.ok) throw new Error("Error al obtener componentes");
  return response.json();
};

export const eliminarComponente = async (id) => {
  const response = await fetch(`${API_URL}/Componentes/${id}`, {
    method: "DELETE"
  });

  if (!response.ok)
    throw new Error("Error al eliminar componente");
};

export const actualizarComponente = async (id, componente) => {
  const response = await fetch(`${API_URL}/Componentes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(componente),
  });

  if (!response.ok) {
    // Si hay un error, intentamos obtener el mensaje de error del server, si no, uno genérico
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar componente");
  }

  // ✅ SOLUCIÓN AL "Unexpected end of JSON input":
  // Verificamos si hay contenido antes de intentar parsear el JSON
  const contentType = response.headers.get("content-type");
  if (response.status === 204 || !contentType || !contentType.includes("application/json")) {
    return null; // Éxito, pero sin cuerpo que procesar
  }

  return response.json();
};

export const getArmados = async () => {
  try {
    const response = await fetch(`${API_URL}/Armados`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})); 
      throw new Error(errorData.message || "Error al obtener armados");
    }
    return await response.json();
  } catch (error) {
    console.error("Error en getArmados service:", error);
    throw error;
  }
};

// Cambiar estado de publicación (público/privado)
export const togglePublicado = async (id) => {
  const response = await fetch(`${API_URL}/Armados/${id}/toggle-public`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`, // Si usas JWT
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) throw new Error("No se pudo cambiar el estado");
  return await response.json();
};

// Eliminar un armado
export const eliminarArmadoAdmin = async (id) => {
  const response = await fetch(`${API_URL}/Armados/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error("No se pudo eliminar el armado");
  return true;
};


export const getCompatibilidades = async () => {
  const response = await fetch(`${API_URL}/Compatibilidades`);
  if (!response.ok) throw new Error("Error al obtener compatibilidades");
  return response.json();
};

// Añade esto a tu archivo api.js
export const guardarCompatibilidad = async (compatibilidad) => {
  const response = await fetch(`${API_URL}/Compatibilidades`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(compatibilidad),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData || "Error al guardar la regla de compatibilidad");
  }
  return response.json();
};

export const eliminarCompatibilidad = async (id) => {
  const response = await fetch(`${API_URL}/Compatibilidades/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("No se pudo eliminar la regla");
  return true;
};

export const actualizarCompatibilidad = async (id, compatibilidad) => {
  const response = await fetch(`${API_URL}/Compatibilidades/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(compatibilidad),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error al actualizar la regla");
  }
  
  // El controlador devuelve NoContent (204), así que no intentamos parsear JSON
  return true; 
};

// Agregar un nuevo componente
export const agregarComponente = async (componente) => {
  const response = await fetch(`${API_URL}/Componentes`, {
    method: "POST", 
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(componente),
  });
  if (!response.ok) throw new Error("Error al agregar componente");
  return response.json();
};

// Obtener componentes por medio de el filtro "Tipo"
export const filtroComponente = async (tipo) => {
  const response = await fetch(`${API_URL}/Componentes?tipo=${tipo}`);

  if (!response.ok) {
    throw new Error("Error al obtener componentes");
  }

  return response.json();
};

// Método para agregar nuevo armado
export const guardarArmado = async (armado) => {
  const response = await fetch(`${API_URL}/Armados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(armado),
  });

  if (!response.ok) {
    // Intentamos obtener el detalle del error que enviamos desde el catch de C#
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detalle || `Error del servidor (${response.status})`);
  }

  return response.json();
};

// Cargar los armados por uid de usuario
export const obtenerMisArmados = async (uid) => {
  try {
    // EL CAMBIO ESTÁ AQUÍ: Quitamos el "/api" porque API_URL ya lo trae
    const url = `${API_URL}/Armados/usuario/${uid}`; 
    console.log("Consultando proyectos en:", url);

    const response = await fetch(url);
    
    if (!response.ok) {
        // En lugar de lanzar un error si es 404 (no tiene proyectos), 
        // podrías manejarlo para que devuelva una lista vacía
        if (response.status === 404) return [];
        
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Detalle del error en obtenerMisArmados:", error);
    throw error;
  }
};

//  Método para evaluar compatibilidad en tiempo real
export const evaluarCompatibilidadTiempoReal = async (componenteIds) => {
  const response = await fetch(`${API_URL}/Armados/evaluar-compatibilidad-tiempo-real`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(componenteIds),
  });

  if (!response.ok) {
    throw new Error("Error al evaluar compatibilidad");
  }

  return response.json();

};

// Método para eliminar un armado por su ID (versión para usuarios, no admins)
export const eliminarArmado = async (armadoId) => {
  const response = await fetch(`${API_URL}/Armados/${armadoId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error("No se pudo eliminar el proyecto");
  }

  // 💡 LA CLAVE: Si el status es 204 (No Content), no llames a .json()
  if (response.status === 204) {
    return true; 
  }

  // Para otros casos, verifica si hay contenido antes de parsear
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  }

  return true;
};

// Método para publicar un armado enviando el nombre del autor
export const publicarArmado = async (armadoId, nombreUsuario) => {
  const nombreLimpio = String(nombreUsuario).split(':')[0].trim();
  
  // Construimos la URL
  const url = `${API_URL}/Armados/${armadoId}/publicar?nombreUsuario=${encodeURIComponent(nombreLimpio)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      // Eliminamos el Content-Type para que el navegador no espere un JSON en el cuerpo
      "Accept": "application/json"
    }
    // NOTA: No enviamos propiedad 'body' en absoluto
  });

  if (!response.ok) {
    // Si da error, leemos el JSON para saber exactamente qué campo falla
    const errorData = await response.json();
    console.error("Error del servidor:", errorData);
    throw new Error(errorData.title || "Error al publicar");
  }

  return response.json();
};

// Obtener todos los armados marcados como publicados
export const getComunidad = async () => {
  const response = await fetch(`${API_URL}/Armados/comunidad`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo cargar la comunidad");
  }

  return response.json();
};

// Quitar un armado de la comunidad
export const despublicarArmado = async (armadoId) => {
  const response = await fetch(`${API_URL}/Armados/${armadoId}/despublicar`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Error al despublicar el armado");
  }

  return response.json();
};

// --- MÉTODOS DE PAGO (STRIPE) ---
/**
 * 1. Envía al usuario a la pasarela de Stripe Checkout.
 * @param {string} uid - El UID del usuario de Firebase.
 * @param {number} tokens - Cantidad de tokens a comprar.
 * @param {number} precioMXN - Precio en pesos (ej: 49.00).
 */
export const iniciarSesionPago = async (uid, tokens, precioMXN) => {
  // Convertimos a centavos (Stripe Requirement)
  const precioCentavos = Math.round(precioMXN * 100);

  const response = await fetch(`${API_URL}/Usuarios/crear-sesion-pago`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      usuarioUid: uid,
      cantidadComprada: tokens,
      precioCentavos: precioCentavos
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || "No se pudo iniciar la pasarela de pago");
  }

  // Retorna { url: "https://checkout.stripe.com/..." }
  return await response.json();
};

/**
 * 2. Valida el resultado del pago al volver de Stripe.
 * @param {string} sessionId - El ID de sesión generado por Stripe.
 * @param {string} uid - El UID del usuario.
 * @param {number} tokens - Tokens a acreditar.
 */
export const confirmarPagoEnServidor = async (sessionId, uid, tokens) => {
  const url = `${API_URL}/Usuarios/confirmar-pago?sessionId=${sessionId}&uid=${uid}&tokens=${tokens}`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.mensaje || "No se pudo verificar el pago con el servidor");
  }

  return await response.json();
};

// Función para sincronizar los datos de Firebase con nuestra DB de SQL
export const sincronizarUsuario = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/Usuarios/sincronizar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: userData.uid,
        nombre: userData.nombre || "Usuario Nuevo",
        correo: userData.correo,
        fechaRegistro: userData.fechaRegistro || new Date().toISOString(),
        tokensDisponibles: userData.tokensDisponibles || 3,
        rol: userData.rol || "user"
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.mensaje || "Error al sincronizar usuario");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en sincronizarUsuario:", error);
    throw error;
  }
};

// Método para generar estadísticas de los usuarios
// En src/services/api.js o donde tengas tus llamadas a la API
export const getStatsUsuarios = async () => {
  try {
    const response = await fetch(`${API_URL}/Usuarios/dashboard-stats`); // Ajusta la URL según tu entorno
    if (!response.ok) throw new Error("Error al obtener estadísticas de usuarios");
    return await response.json();
  } catch (error) {
    console.error("Error en getStatsUsuarios:", error);
    throw error;
  }
};