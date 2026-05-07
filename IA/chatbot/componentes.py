from armatuxpc_chatbot.conexion_backend import obtener_componentes

def catalogo_real():

    return {
        "cpu": obtener_componentes(1),
        "gpu": obtener_componentes(2),
        "ram": obtener_componentes(3),
        "almacenamiento": obtener_componentes(4),
        "fuente": obtener_componentes(5),
        "motherboard": obtener_componentes(6),
        "gabinete": obtener_componentes(7),
        "refrigeracion": obtener_componentes(8),
    }