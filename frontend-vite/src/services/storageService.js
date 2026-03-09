// El proceso que sigue es el siguiente:
// 1. El usuario selecciona un archivo de imagen en el formulario de AgregarComponente.
// 2. Al seleccionar el archivo, se llama a la función subirImagen que se encuentra en storageService.js.
// 3. La función subirImagen toma el archivo seleccionado, lo sube a Firebase Storage y obtiene la URL de descarga de la imagen.
// 4. La URL de la imagen se devuelve a AgregarComponente y se asigna al campo "imagen" del formulario.
// 5. Cuando el usuario envía el formulario, se envía toda la información del componente, incluyendo la URL de la imagen, al backend para agregar el nuevo componente a la base de datos.

import { storage } from "../utilidades/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const subirImagen = async (file, tipo, modelo) => {

  if (!file) {
    throw new Error("No se seleccionó ninguna imagen");
  }
  // Variables sanitazadas para construir la ruta de almacenamiento en Firebase Storage, evitando espacios y caracteres especiales que puedan causar problemas al subir el archivo
  const tipoSeguro = tipo.replace(/\s+/g, "-").toLowerCase();
  const modeloSeguro = modelo.replace(/\s+/g, "-").toLowerCase();

  // Generamos un nombre único para el archivo de imagen utilizando la marca de tiempo actual y el nombre original del archivo, asegurándonos de que no haya conflictos de nombres en Firebase Storage
  const nombreArchivo = `${Date.now()}_${file.name
    .toLowerCase()
    .replace(/\s+/g, "-")}`;
  
  // Construimos la ruta de almacenamiento en Firebase Storage utilizando el tipo y modelo del componente para organizar las imágenes de manera estructurada, lo que facilita su gestión y acceso posterior
  const ruta = `componentes/${tipoSeguro}/${modeloSeguro}/${nombreArchivo}`;

  const storageRef = ref(storage, ruta); // Creamos una referencia al archivo en Firebase Storage utilizando la ruta construida

  const snapshot = await uploadBytes(storageRef, file); // Subimos el archivo a Firebase Storage utilizando la referencia creada y obtenemos un snapshot del proceso de carga

  // Obtenemos la URL de descarga de la imagen una vez que se ha subido correctamente a Firebase Storage, lo que nos permite asignar esta URL al campo "imagen" del componente para su uso posterior en la aplicación
  const url = await getDownloadURL(snapshot.ref);

  return url;
};