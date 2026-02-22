import React, { useEffect, useState } from "react";
import { getComponentes, getArmados, getCompatibilidades } from "../services/api";

export default function PruebaBackend() {
  const [componentes, setComponentes] = useState([]);
  const [armados, setArmados] = useState([]);
  const [compatibilidades, setCompatibilidades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compData, armData, compatData] = await Promise.all([
          getComponentes(),
          getArmados(),
          getCompatibilidades()
        ]);

        setComponentes(compData);
        setArmados(armData);
        setCompatibilidades(compatData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>Cargando datos del backend...</p>;

  console.log("Componentes:", componentes);
  console.log("Armados:", armados);
  console.log("Compatibilidades:", compatibilidades);

  return (
    <div>
      <h2>Lista de Componentes</h2>
      {componentes.map(c => (
        <div key={c.componenteId} style={{border: "1px solid gray", margin: "10px", padding: "10px"}}>
          <strong>{c.nombre}</strong>
          <p>Marca: {c.marca}</p>
          <p>Modelo: {c.modelo}</p>
          <p>Precio: ${c.precio}</p>
          <p>Tipo: {c.tipo}</p>
          <p>Consumo: {c.consumoWatts}W</p>
          <p>Capacidad: {c.capacidadWatts}W</p>
        </div>
      ))}

    <h2>Lista de Armados</h2>
    {armados.map(a => (
      <div key={a.armadoId} style={{border: "1px solid gray", margin: "10px", padding: "10px"}}>
        <h3>{a.nombreArmado}</h3>

        {a.componentes.map(c => (
          <p key={c.componenteId}>
            <strong>{c.tipo}:</strong> {c.nombre}
          </p>
        ))}

      </div>
    ))}

      <h2>Lista de Compatibilidades</h2>
      {compatibilidades.map(comp => (
        <div key={comp.compatibilidadId}>
            Componente {comp.componenteAId} con {comp.componenteBId}
            → {comp.esCompatible ? "Compatible" : "No compatible"}
        </div>
        ))}
        </div>
  );
  
}
