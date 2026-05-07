import requests
import json

def interpretar(mensaje):

    try:
        prompt = f"""
Extrae intención del usuario.

Responde SOLO JSON:

{{
"uso":"gaming/oficina/streaming/diseno/null",
"presupuesto":"bajo/medio/alto/null",
"cpu":"amd/intel/null",
"rgb":"si/no/null"
}}

Mensaje: {mensaje}
"""

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "gemma:2b",
                "prompt": prompt,
                "stream": False
            }
        )

        texto = response.json()["response"]

        inicio = texto.find("{")
        fin = texto.rfind("}") + 1

        return json.loads(texto[inicio:fin])

    except:
        return {}