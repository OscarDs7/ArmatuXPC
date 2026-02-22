// Interface de gestión de cuentas para administradores

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

//import "../estilos/GestionCuentasAdmin.css"; // archivo de estilos externos

// Componente GestionCuentasAdmin
// Este componente muestra una interfaz para que los administradores puedan gestionar las cuentas de los usuarios
// Incluye una tabla con las cuentas de los usuarios y botones para editar o eliminar cada cuenta
export default function GestionCuentasAdmin() { 
    // Datos de ejemplo para las cuentas de los usuarios
    const cuentas = [
        { id: 1, nombre: "Usuario1", email: "Usuario1@example.com" },
        { id: 2, nombre: "Usuario2", email: "Usuario2@example.com" },
        { id: 3, nombre: "Usuario3", email: "Usuario3@example.com" },
        { id: 4, nombre: "Usuario4", email: "Usuario4@example.com" },
        { id: 5, nombre: "Usuario5", email: "Usuario5@example.com" }
    ];

    return (
        <div className="gestion-cuentas-container">
            <h1 className="gestion-cuentas-title">Gestión de Cuentas</h1>
            <table className="gestion-cuentas-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cuentas.map((cuenta) => (
                        <tr key={cuenta.id}>
                            <td>{cuenta.id}</td>    
                            <td>{cuenta.nombre}</td>
                            <td>{cuenta.email}</td>
                            <td>
                                <button className="gestion-cuentas-btn">Editar</button>
                                <button className="gestion-cuentas-btn">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}