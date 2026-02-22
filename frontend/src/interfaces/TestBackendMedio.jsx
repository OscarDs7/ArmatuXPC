import React, { useEffect, useState } from "react";
import { getComponentes } from "../services/api";

export default function PruebaBackend() {
  const [componentes, setComponentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComponentes()
      .then(data => setComponentes(data))
      .catch(error => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando...</p>;

  return (
    <div>
      <h2>Lista de Componentes</h2>
      {componentes.map(c => (
        <div key={c.id}>
          <strong>{c.nombre}</strong> - ${c.precio}
        </div>
      ))}
    </div>
  );
}
