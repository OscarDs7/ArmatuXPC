// El proceso que sigue es el siguiente:
// 1. El usuario selecciona un archivo de imagen en el formulario de AgregarComponente.
// 2. Al seleccionar el archivo, se llama a la función subirImagen que se encuentra en storageService.js.
// 3. La función subirImagen toma el archivo seleccionado, lo sube a Firebase Storage y obtiene la URL de descarga de la imagen.
// 4. La URL de la imagen se devuelve a AgregarComponente y se asigna al campo "imagen" del formulario.
// 5. Cuando el usuario envía el formulario, se envía toda la información del componente, incluyendo la URL de la imagen, al backend para agregar el nuevo componente a la base de datos.

import { storage } from "../utilidades/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const subirImagen = async (file) => {

  const nombreArchivo = `componentes/${Date.now()}_${file.name}`;

  const storageRef = ref(storage, nombreArchivo);

  await uploadBytes(storageRef, file);

  const url = await getDownloadURL(storageRef);

  return url;
};