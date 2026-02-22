// src/services/api.js
// Servicio para interactuar con el backend

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5031/api";

export const getComponentes = async () => {
  const response = await fetch(`${API_URL}/Componentes`);
  if (!response.ok) throw new Error("Error al obtener componentes");
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
