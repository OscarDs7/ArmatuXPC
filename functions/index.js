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

    await admin.firestore().collection("Usuario").doc(userRecord.uid).set({
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

  const { uid } = request.data; // UID del usuario a eliminar 

  // Evitar que un admin elimine su propia cuenta
  if (uid === request.auth.uid) {
    throw new HttpsError(
      "permission-denied",
      "No puedes eliminar tu propia cuenta."
    );
  }

  const userToDelete = await admin.auth().getUser(uid);

  if (userToDelete.customClaims?.admin) {
    throw new HttpsError("permission-denied", "No puedes eliminar otro admin.");
  }

  try {
    await admin.auth().deleteUser(uid);

    await admin.firestore()
      .collection("Usuario")
      .doc(uid) // uid = docId
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

  const { uid, nuevoRol } = request.data;

  const rolesValidos = ["user", "admin"]; // roles permitidos para hacer el cambio

  // Validamos que sea alguno de estos roles
  if (!rolesValidos.includes(nuevoRol)) {
    throw new HttpsError("invalid-argument", "Rol inválido.");
  }

  try {

    // 1️⃣ Actualizar custom claim
    await admin.auth().setCustomUserClaims(uid, {
      admin: nuevoRol === "admin",
    });

    // 2️⃣ Actualizar Firestore
    await admin.firestore()
      .collection("Usuario")
      .doc(uid)
      .update({
        Rol: nuevoRol,
      });

    return { success: true };

  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});
