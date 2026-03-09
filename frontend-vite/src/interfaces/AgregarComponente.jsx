// Esta interfaz define la estructura de datos para agregar un nuevo componente desde el frontend al backend. Se utiliza para enviar los datos del nuevo componente a través de una solicitud POST al backend.
// Pasandole esta estructura, el backend podrá crear un nuevo registro de componente en la base de datos con los datos proporcionados incluyendo el nombre, marca, modelo, precio, tipo, consumo energético, capacidad de watts (si es fuente de poder) y la imagen del componente.
// Pasandole la función POST del servicio api.js, el frontend podrá enviar esta información al backend para agregar el nuevo componente a la base de datos y luego actualizar la lista de componentes en el frontend para mostrar el nuevo componente agregado.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { agregarComponente } from "../services/api";
import { subirImagen } from "../services/storageService";

export default function AgregarComponenteAdmin() {

  const [formData, setFormData] = useState({
    nombre: "",
    marca: "",
    modelo: "",
    precio: "",
    tipo: "",
    consumoWatts: "",
    capacidadWatts: ""
  });
  
  // Destructurar fromData para facilitar el acceso a los campos individuales del formulario
  const { nombre, marca, modelo, precio, tipo, consumoWatts, capacidadWatts } = formData;

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [imagenFile, setImagenFile] = useState(null);
  const previewUrl = imagenFile ? URL.createObjectURL(imagenFile) : null; // Generamos una URL de vista previa para mostrar la imagen seleccionada antes de subirla a Firebase Storage

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Actualizamos el estado del formulario con los nuevos valores ingresados por el usuario
    setFormData(prev => ({
    ...prev,
    [name]: value
    }));
  };

  // Construimos el objeto componente a enviar al backend, asegurándonos de convertir los campos numéricos a números y asignar la URL de la imagen si se ha subido correctamente
  const buildComponente = (imagenUrl) => ({
    nombre: nombre.trim(),
    marca: marca.trim(),
    modelo: modelo.trim(),
    precio: parseFloat(precio),
    tipo: tipo,
    consumoWatts: parseFloat(consumoWatts),
    capacidadWatts: capacidadWatts
        ? Number(capacidadWatts)
        : undefined,
    imagenUrl

    });

    // Función que se ejecuta al enviar el formulario para agregar un nuevo componente. 
    // Se encarga de subir la imagen a Firebase Storage si se ha seleccionado un archivo, obtener la URL de la imagen y 
    // luego enviar toda la información del componente al backend para agregarlo a la base de datos
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
        // Indicamos que el proceso de agregar el componente está en curso para mostrar un mensaje de carga al usuario
      setLoading(true);

        let imagenUrl = ""; // Inicializamos la variable para almacenar la URL de la imagen

        // Validamos el tamaño de la imagen antes de subirla a Firebase Storage, limitándola a 2MB para evitar problemas de rendimiento y almacenamiento
        if (imagenFile && imagenFile.size > 2 * 1024 * 1024) {
            setMensaje("La imagen no debe superar 2MB");
            return;
        }
        // Si se ha seleccionado un archivo de imagen, lo subimos a Firebase Storage y obtenemos la URL de descarga de la imagen para asignarla al campo "imagen" del componente
        if (imagenFile) {
          imagenUrl = await subirImagen(imagenFile);
        }

      // Creamos el objeto componente con los datos del formulario, incluyendo la URL de la imagen si se ha subido correctamente
      const componente = buildComponente(imagenUrl);

      console.log("JSON enviado:", JSON.stringify(componente));
      await agregarComponente(componente);

      setMensaje("Componente agregado correctamente");
      // Limpiar mensaje después de 3 segundos para que el usuario pueda ver la confirmación antes de que desaparezca
        setTimeout(() => setMensaje(""), 3000);

      // Limpiamos el formulario después de agregar el componente
      setFormData({
        nombre: "",
        marca: "",
        modelo: "",
        precio: "",
        tipo: "",
        consumoWatts: "",
        capacidadWatts: "",
        imagenUrl: ""
      });

      setImagenFile(null); // Limpiamos el estado del archivo de imagen después de agregar el componente

    } catch (error) {
        console.error(error);
        setMensaje(error.message || "Error al agregar el componente");
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-slate-900 to-black text-white px-6 py-12 flex justify-center items-center">

      <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-slate-700">

        <h1 className="text-2xl font-semibold mb-6 text-center">
          Ingrese los datos
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={nombre}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
            required
          />

          <select
            name="tipo"
            value={tipo}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700"
            >
            <option value="">Seleccionar tipo</option>
            <option value="CPU">CPU</option>
            <option value="GPU">GPU</option>
            <option value="MemoriaRAM">Memoria RAM</option>
            <option value="Almacenamiento">Almacenamiento</option>
            <option value="FuentePoder">Fuente de poder</option>
            <option value="PlacaBase">Placa base</option>
            <option value="Gabinete">Gabinete</option>
            </select>

          <input
            type="text"
            name="marca"
            placeholder="Marca"
            value={marca}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
            required
          />

          <input
            type="text"
            name="modelo"
            placeholder="Modelo"
            value={modelo}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
            required
          />

          <input
            type="number"
            name="precio"
            placeholder="Precio"
            value={precio}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
            required
          />

          <input
            type="number"
            name="consumoWatts"
            placeholder="Consumo energético (W)"
            value={consumoWatts}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
            required
          />

          <input
            type="number"
            name="capacidadWatts"
            placeholder="Capacidad watts (solo Fuente de poder - opcional)"
            value={capacidadWatts}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
          />

          <input
            type="file"
            accept="image/*"
            placeholder="URL de la imagen"
            onChange={(e) => setImagenFile(e.target.files[0])}
            className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:outline-none focus:border-indigo-500"
          />
          
           {imagenFile && (
                <div className="mt-2 flex justify-center">
                <img  src={previewUrl
                    } alt="Vista previa" className="max-w-32 max-h-32 rounded-lg object-cover border border-slate-700" />
                </div>
                )
            }
            
          {imagenFile && (
            <p className="text-sm text-gray-400">
                Imagen seleccionada: {imagenFile.name} ({(imagenFile.size / 1024).toFixed(2)} KB)
            </p>
          )}

          {mensaje && (
            <p className="text-center text-sm text-indigo-400">
              {mensaje}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition p-3 rounded-lg font-semibold"
          >
            {loading ? "Publicando..." : "Aprobar y publicar"}
          </button>

          <button
            type="button"
            onClick={() =>  navigate("/dashboard-admin")}
            className="w-full bg-slate-700 hover:bg-slate-600 transition p-3 rounded-lg"
          >
            Regresar
          </button>

        </form>

      </div>

    </div>

  );
}