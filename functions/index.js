const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Crear administrador
 */
exports.crearAdmin = onCall(async (request) => {

  // Verificar que el usuario esté autenticado y tenga permisos de admin
  if (!request.auth || request.auth.token.admin !== true) {
  throw new HttpsError(
    "permission-denied",
    "Solo administradores pueden realizar esta acción."
  );
}

  const { nombre, correo, password } = request.data; // Datos enviados desde el frontend

  // Validación básica de datos
  if (!nombre || !correo || !password) {
    throw new HttpsError("invalid-argument", "Datos incompletos.");
  }

  try {
    const userRecord = await admin.auth().createUser({
      email: correo,
      password: password,
    });

    // 🔥 ASIGNAR CLAIM REAL
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true,
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
  if (!request.auth || request.auth.token.admin !== true) {
  throw new HttpsError(
    "permission-denied",
    "Solo administradores pueden realizar esta acción."
  );
}

  const { uid, docId } = request.data; // UID del usuario a eliminar y ID del documento en Firestore

  // Evitar que un admin elimine su propia cuenta
  if (uid === request.auth.uid) {
  throw new HttpsError(
    "permission-denied",
    "No puedes eliminar tu propia cuenta."
  );
}

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
    if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError(
      "permission-denied",
      "Solo administradores pueden realizar esta acción."
    );
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
