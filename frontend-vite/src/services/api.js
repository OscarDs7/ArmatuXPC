// src/services/api.js
// Servicio para interactuar con el backend desde el frontend.
// Este archivo define funciones para realizar solicitudes HTTP al backend, como obtener la lista de componentes, armados y compatibilidades, así como agregar un nuevo componente a la base de datos u otras funciones. 

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5031/api";

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
