import requests

BASE_URL = "http://10.191.176.243:5001"

# ---------------------------------------------------
# COMPONENTES
# ---------------------------------------------------
def obtener_componentes(tipo):
    try:
        url = f"{BASE_URL}/api/Componentes?tipo={tipo}"
        print("🔎 Consultando:", url)

        r = requests.get(url, timeout=10)

        print("STATUS:", r.status_code)

        if r.status_code == 200:
            print("✅ Componentes reales cargados")
            return r.json()

    except Exception as e:
        print("❌ Error backend:", e)

    return None


# ---------------------------------------------------
# REGLAS COMPATIBILIDAD
# ---------------------------------------------------
def obtener_reglas_compatibilidad():

    try:
        url = f"{BASE_URL}/Compatibilidades/reglas"

        r = requests.get(url, timeout=8)

        if r.status_code == 200:
            print("✅ Reglas reales cargadas")
            return r.json()

    except Exception as e:
        print("❌ Error reglas:", e)

    return None