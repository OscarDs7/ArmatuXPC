from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .ia import responder_ia
from .conexion_backend import obtener_componentes

app = FastAPI()

# ---------------- CORS ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MODELO ----------------
class UserInput(BaseModel):
    mensaje: str
    user_id: str = "anonimo"

usuarios = {}

# ---------------- TIPOS ----------------
TIPOS = {
    "cpu": 1,
    "gpu": 2,
    "ram": 3,
    "almacenamiento": 4,
    "fuente": 5,
    "motherboard": 6,
    "gabinete": 7,
    "refrigeracion": 8
}

# ---------------- ESTADO ----------------
def nuevo_estado():
    return {
        "paso": 0,
        "modo": None,
        "uso": None,
        "presupuesto": None,
        "ultimo_armado": None
    }

# ---------------- RESPUESTA ----------------
def respuesta(texto, botones=None):
    return {
        "respuesta": {
            "resumen": texto.strip(),
            "botones": botones or []
        }
    }

# ---------------- HELPERS ----------------
def cargar(tipo):
    try:
        return obtener_componentes(TIPOS[tipo]) or []
    except:
        return []

def nombres(lista):
    return [x["nombre"] for x in lista]

def precio(x):
    return float(x.get("precio", 0))

def watts(x):
    return float(x.get("consumoWatts", 0))

# =================================================
# CHATBOT
# =================================================
@app.post("/chatbot")
def chatbot(data: UserInput):

    user = data.user_id
    msg = data.mensaje.lower().strip()

    if user not in usuarios:
        usuarios[user] = nuevo_estado()

    estado = usuarios[user]

    # SALUDO
    if msg in ["hola", "hi", "buenas"]:
        return respuesta("Hola 👋 soy tu asistente de ArmaTuXPC", ["Armar PC", "Último Armado"])

    # HISTORIAL
    if msg in ["último armado", "ultimo armado"]:
        return respuesta(estado["ultimo_armado"] or "No tienes armados previos.", ["Armar PC"])

    # INICIO
    if "armar" in msg:
        usuarios[user] = nuevo_estado()
        usuarios[user]["paso"] = 1
        return respuesta("🛠️ ¿Cómo deseas armarla?", ["Manual", "Automática"])

    # MODO
    if estado["paso"] == 1:
        if "autom" in msg:
            estado["modo"] = "auto"
            estado["paso"] = 2
            return respuesta("🤖 ¿Para qué usarás la PC?", ["Gaming", "Oficina"])

        return respuesta("Selecciona una opción", ["Manual", "Automática"])

    # PASO 2
    if estado["paso"] == 2:
        estado["uso"] = msg
        estado["paso"] = 3
        return respuesta("💰 ¿Cuál es tu presupuesto?", ["Bajo", "Medio", "Alto"])

    # PASO 3
    if estado["paso"] == 3:
        estado["presupuesto"] = msg
        estado["paso"] = 4
        return respuesta("🧠 ¿AMD o Intel?", ["AMD", "Intel"])

    # PASO FINAL
    if estado["paso"] == 4:

        cpus = cargar("cpu")
        gpus = cargar("gpu")
        rams = cargar("ram")
        fuentes = cargar("fuente")
        discos = cargar("almacenamiento")
        gabinetes = cargar("gabinete")
        motherboards = cargar("motherboard")
        refrigeraciones = cargar("refrigeracion")

        if not cpus:
            return respuesta("❌ Backend no disponible", ["Armar PC"])

        cpu = sorted(cpus, key=precio)[0]
        gpu = sorted(gpus, key=precio)[0] if gpus else {"nombre": "Integrada", "precio": 0}
        ram = sorted(rams, key=precio)[0]

        disco = sorted(discos, key=precio)[0]
        fuente = sorted(fuentes, key=precio)[0]
        gabinete = sorted(gabinetes, key=precio)[0]

        motherboard = sorted(motherboards, key=precio)[0] if motherboards else {"nombre": "No disponible"}
        refrigeracion = sorted(refrigeraciones, key=precio)[0] if refrigeraciones else {"nombre": "Stock"}

        total = sum(map(precio, [cpu, gpu, ram, disco, fuente, gabinete, motherboard, refrigeracion]))
        consumo = sum(map(watts, [cpu, gpu, ram, disco]))

        texto = f"""🤖 PC Automática PRO

🧠 CPU: {cpu['nombre']}
🎮 GPU: {gpu['nombre']}
🧩 Motherboard: {motherboard['nombre']}
❄️ Refrigeración: {refrigeracion['nombre']}
💾 RAM: {ram['nombre']}
⚡ Fuente: {fuente['nombre']}
🖥️ Gabinete: {gabinete['nombre']}
📦 Almacenamiento: {disco['nombre']}

💰 Total: ${total:,.0f} MXN
⚡ Consumo: {consumo:.0f}W"""

        estado["ultimo_armado"] = texto
        usuarios[user] = nuevo_estado()
        usuarios[user]["ultimo_armado"] = texto

        return respuesta(texto, ["Armar PC", "Último Armado"])

    # FALLBACK IA
    try:
        texto = responder_ia(msg)
        return respuesta(texto, ["Armar PC"])
    except:
        return respuesta("Puedo ayudarte a armar una PC.", ["Armar PC"])