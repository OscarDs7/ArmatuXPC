import { useNavigate } from "react-router-dom";
import { comprarTokens } from "../services/api";
import "../estilos/ComprarTokens.css";

export default function ComprarTokens() {
  const navigate = useNavigate();
  const uid = localStorage.getItem("userUid");

  const paquetes = [
    { id: 1, nombre: "Básico", tokens: 3, precio: "$49 MXN", color: "#3498db" },
    { id: 2, nombre: "Pro", tokens: 10, precio: "$129 MXN", color: "#9b59b6" },
    { id: 3, nombre: "Ilimitado (Mes)", tokens: 100, precio: "$299 MXN", color: "#f1c40f" },
  ];

  const handleCompra = async (cantidad) => {
    try {
      // Por ahora simulamos la compra exitosa
      await comprarTokens(uid, cantidad);
      alert("🎉 ¡Tokens añadidos con éxito! Ya puedes seguir armando.");
      navigate("/mis-armados");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="compra-container">
      <button className="btn-volver" onClick={() => navigate(-1)}>← Volver</button>
      <h2 className="title">Aumenta tu capacidad de Armado 🚀</h2>
      
      <div className="paquetes-grid">
        {paquetes.map((p) => (
          <div key={p.id} className="paquete-card" style={{ borderTop: `6px solid ${p.color}` }}>
            <h3>{p.nombre}</h3>
            <div className="token-circle">+{p.tokens}</div>
            <p className="precio">{p.precio}</p>
            <button className="btn-comprar" onClick={() => handleCompra(p.tokens)}>
              Seleccionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}