import { useEffect, useState } from "react";

function TablaUsuarios() {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/usuarios")
      .then(res => res.json())
      .then(data => setDatos(data));
  }, []);

  return (
    <table border="1">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Correo</th>
        </tr>
      </thead>
      <tbody>
        {datos.map(usuario => (
          <tr key={usuario.id}>
            <td>{usuario.id}</td>
            <td>{usuario.nombre}</td>
            <td>{usuario.correo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TablaUsuarios;
