from armatuxpc_chatbot.compatibilidad import motherboard_compatible, fuente_recomendada

def elegir(lista, presupuesto):

    if presupuesto == "bajo":
        return min(lista, key=lambda x: x["precio"])

    if presupuesto == "alto":
        return max(lista, key=lambda x: x["precio"])

    lista = sorted(lista, key=lambda x: x["precio"])
    return lista[len(lista)//2]


def generar_pc(datos, catalogo):

    cpus = catalogo["cpu"]

    if datos["cpu"] == "amd":
        cpus = [x for x in cpus if x["marca"] == "AMD"]

    if datos["cpu"] == "intel":
        cpus = [x for x in cpus if x["marca"] == "Intel"]

    cpu = elegir(cpus, datos["presupuesto"])

    board = motherboard_compatible(cpu, catalogo["motherboard"])

    # GPU según uso
    if datos["uso"] in ["gaming", "streaming", "diseno"]:
        gpu = elegir(catalogo["gpu"], datos["presupuesto"])
    else:
        gpu = {"nombre": "Integrada", "watts": 0}

    ram = elegir(catalogo["ram"], datos["presupuesto"])

    # más RAM para diseño/stream
    if datos["uso"] in ["streaming", "diseno"]:
        ram = catalogo["ram"][-1]

    fuente = fuente_recomendada(gpu, catalogo["fuente"])
    ssd = elegir(catalogo["almacenamiento"], datos["presupuesto"])

    gabinete = "Gabinete RGB" if datos["rgb"] == "si" else "Gabinete estándar"

    return {
        "cpu": cpu["nombre"],
        "motherboard": board["nombre"],
        "ram": ram["nombre"],
        "gpu": gpu["nombre"],
        "almacenamiento": ssd["nombre"],
        "fuente": fuente["nombre"],
        "gabinete": gabinete
    }