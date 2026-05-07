from armatuxpc_chatbot.conexion_backend import obtener_compatibilidades

def son_compatibles(id_a, id_b):

    reglas = obtener_compatibilidades()

    for r in reglas:

        if (
            (r["componenteAId"] == id_a and r["componenteBId"] == id_b)
            or
            (r["componenteAId"] == id_b and r["componenteBId"] == id_a)
        ):
            return r["esCompatible"]

    return True