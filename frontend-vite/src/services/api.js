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
  const response = await fetch(`${API_URL}/Armados`);
  if (!response.ok) throw new Error("Error al obtener armados");
  return response.json();
};

export const getCompatibilidades = async () => {
  const response = await fetch(`${API_URL}/Compatibilidades`);
  if (!response.ok) throw new Error("Error al obtener compatibilidades");
  return response.json();
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

// Método para eliminar un armado por su ID
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

//  Método para recargar tokens (ejemplo: comprar más tokens)
export const comprarTokens = async (uid, cantidad) => {
  const response = await fetch(`${API_URL}/api/usuarios/recargar-tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      usuarioUid: uid, 
      cantidadComprada: cantidad 
      // paymentId: "id_de_stripe_aqui" (Próximamente)
    }),
  });
  if (!response.ok) throw new Error("No se pudo procesar la compra");
  return await response.json();
};