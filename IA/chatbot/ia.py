import ollama
import json

# ==========================================
# RESPUESTA LIBRE
# ==========================================
def responder_ia(mensaje):

    r = ollama.chat(
        model="tinyllama",
        messages = [
            {
                "role": "system",
                "content": "Eres un asistente experto en armado de computadoras. Responde de forma clara, útil y directa. No generes artículos, solo recomendaciones."
            },
            {
                "role": "user",
                "content": mensaje
            }
        ]
    )

    return r["message"]["content"]


# ==========================================
# INTERPRETAR NECESIDAD DEL USUARIO
# ==========================================
def interpretar_pc(mensaje):

    prompt = f"""
    Genera una configuración de PC COMPLETA en JSON.

    {mensaje}
    """

    r = ollama.chat(
        model="tinyllama",
        messages=[{"role": "user", "content": prompt}]
    )

    texto = r["message"]["content"]

    # 🔥 VALORES POR DEFECTO (CLAVE)
    estructura_base = {
        "cpu": "No especificado",
        "gpu": "No especificado",
        "ram": "No especificado",
        "fuente": "No especificado",
        "gabinete": "No especificado",
        "almacenamiento": "No especificado",
        "motherboard": "No especificado",
        "refrigeracion": "No especificado",
        "total": "No especificado",
        "consumo": "No especificado"
    }

    try:
        data = json.loads(texto)

        # 🔥 COMPLETAR CAMPOS FALTANTES
        for key in estructura_base:
            if key not in data or not data[key]:
                data[key] = estructura_base[key]

        return data

    except:
        # 🔥 FALLBACK TOTAL
        return estructura_base