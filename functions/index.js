const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Crear administrador
 */
exports.crearAdmin = onCall(async (request) => {

  // Verificar que el usuario esté autenticado y tenga permisos de admin
  if (!request.auth || !request.auth.token.admin) {
        throw new HttpsError("permission-denied", "Solo administradores");
    }

  const { nombre, correo, password } = request.data; // Datos enviados desde el frontend

  try {
    const userRecord = await admin.auth().createUser({
      email: correo,
      password: password,
    });

    await admin.firestore().collection("Usuario").add({
      UID: userRecord.uid,
      Nombre: nombre,
      Correo: correo,
      Rol: "admin",
      FechaRegistro: new Date(),
    });

    return { success: true };

  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});


/**
 * Eliminar usuario
 */
exports.eliminarUsuario = onCall(async (request) => {

  // Verificar que el usuario esté autenticado y tenga permisos de admin
  if (!request.auth || !request.auth.token.admin) {
        throw new HttpsError("permission-denied", "Solo administradores");
    }

  const { uid, docId } = request.data;

  try {
    await admin.auth().deleteUser(uid);

    await admin.firestore()
      .collection("Usuario")
      .doc(docId)
      .delete();

    return { success: true };

  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});

/**
 * Cambiar rol de usuario
 */
exports.cambiarRol = onCall(async (request) => {

   // Verificar que el usuario esté autenticado y tenga permisos de admin
  if (!request.auth || !request.auth.token.admin) {
        throw new HttpsError("permission-denied", "Solo administradores");
    }

  const { uid, docId, nuevoRol } = request.data;

  try {

    // 1️⃣ Actualizar custom claim
    await admin.auth().setCustomUserClaims(uid, {
      admin: nuevoRol === "admin",
    });

    // 2️⃣ Actualizar Firestore
    await admin.firestore()
      .collection("Usuario")
      .doc(docId)
      .update({
        Rol: nuevoRol,
      });

    return { success: true };

  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});