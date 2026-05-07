def generar_configuracion(uso, presupuesto, cpu_preferencia, necesita_gpu, cpu):
    reglas = []

    cpu = None
    motherboard = None
    ram = None
    gpu = None
    almacenamiento = None
    fuente = None

    # PASO 2: Preferencia de CPU
    if cpu_preferencia == "amd":
        cpu = "Ryzen 5 5600"
        motherboard = "B550"
        reglas.append("Preferencia AMD aplicada")

    elif cpu_preferencia == "intel":
        cpu = "Core i5 12400"
        motherboard = "B660"
        reglas.append("Preferencia Intel aplicada")

    # PASO 3: Uso del equipo
    if uso == "gaming":
        gpu = "RTX 3060"
        almacenamiento = "SSD 1 TB"
        reglas.append("Uso Gaming: prioridad en GPU y almacenamiento")

    elif uso == "oficina":
        gpu = None
        almacenamiento = "SSD 512 GB"
        reglas.append("Uso Oficina: no se requiere GPU dedicada")

    # PASO 6: Decisión explícita del usuario sobre GPU
    if necesita_gpu == "no":
        gpu = None
        reglas.append("Usuario indicó que no necesita GPU dedicada")

    elif necesita_gpu == "si" and gpu is None:
        gpu = "GTX 1650"
        reglas.append("Usuario indicó que necesita GPU dedicada")

    # PASO 4: Presupuesto (REGLA DOMINANTE)
    if presupuesto < 12000:
        ram = "8 GB DDR4"
        gpu = None
        almacenamiento = "SSD 512 GB"
        fuente = "500W"
        reglas.append("Presupuesto bajo: configuración básica optimizada")

    # PASO 5: Validación final
    if cpu is None:
        cpu = "CPU genérica compatible"
        reglas.append("CPU por defecto asignada")

    if motherboard is None:
        motherboard = "Motherboard compatible con CPU"
        reglas.append("Motherboard genérica asignada")

    if ram is None:
        ram = "8 GB DDR4"
        reglas.append("RAM mínima por defecto asignada")

    if almacenamiento is None:
        almacenamiento = "SSD 512 GB"
        reglas.append("Almacenamiento por defecto asignado")

    if fuente is None:
        fuente = "600W"
        reglas.append("Fuente por defecto asignada")

    # PASO 7: Resumen
    resumen = f"Configuración recomendada para uso de {uso}"

    # 🎯 MENSAJE MÁS HUMANO

    if uso == "gaming":
        descripcion_uso = "juegos y alto rendimiento gráfico"
    else:
        descripcion_uso = "tareas de oficina y uso diario"

    if presupuesto < 12000:
        descripcion_presupuesto = "manteniendo un presupuesto accesible"
    elif presupuesto > 18000:
        descripcion_presupuesto = "aprovechando un presupuesto alto para máximo rendimiento"
    else:
        descripcion_presupuesto = "logrando un equilibrio entre rendimiento y costo"
    if gpu is None:
        resumen += " No incluye tarjeta gráfica dedicada, ya que no es necesaria para este tipo de uso."
    else:
        resumen += f" Incluye una {gpu} para mejorar el rendimiento gráfico."

    resumen = f"He preparado una configuración ideal para lo que necesitas 👇\n\n"
    resumen += f"Esta PC está pensada para {descripcion_uso}, {descripcion_presupuesto}."

    # ✅ RETURN SIEMPRE SE EJECUTA
    return {
        "resumen": resumen,
        "componentes": {
            "cpu": cpu,
            "motherboard": motherboard,
            "ram": ram,
            "gpu": gpu,
            "almacenamiento": almacenamiento,
            "fuente": fuente
        },
        "justificacion": reglas
    }



    
   

