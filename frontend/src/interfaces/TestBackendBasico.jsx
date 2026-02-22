import React, { useEffect, useState } from "react";

export default function TestBackend() {
  const [componentes, setComponentes] = useState([]);
  const [armados, setArmados] = useState([]);
  const [compatibilidades, setCompatibilidades] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5031/api/Componentes")
      .then(res => res.json())
      .then(data => setComponentes(data))
      .catch(err => console.error("Error componentes:", err));

    fetch("http://localhost:5031/api/Armados")
      .then(res => res.json())
      .then(data => setArmados(data))
      .catch(err => console.error("Error armados:", err));

    fetch("http://localhost:5031/api/Compatibilidades")
      .then(res => res.json())
      .then(data => setCompatibilidades(data))
      .catch(err => console.error("Error compatibilidades:", err));
  }, []);

  return (
    <div>
      <h2>Componentes</h2>
      <pre>{JSON.stringify(componentes, null, 2)}</pre>

      <h2>Armados</h2>
      <pre>{JSON.stringify(armados, null, 2)}</pre>

      <h2>Compatibilidades</h2>
      <pre>{JSON.stringify(compatibilidades, null, 2)}</pre>
    </div>
  );
}
