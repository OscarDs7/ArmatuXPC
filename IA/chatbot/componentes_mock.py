def obtener_mock():
    return {

        "cpu": [
            {
                "nombre": "Ryzen 5 5600X",
                "marca": "AMD",
                "socket": "AM4",
                "precio": 3200,
                "watts": 105
            },
            {
                "nombre": "Intel i5 12400F",
                "marca": "Intel",
                "socket": "LGA1700",
                "precio": 3600,
                "watts": 125
            }
        ],

        "motherboard": [
            {
                "nombre": "B550",
                "socket": "AM4",
                "precio": 2200
            },
            {
                "nombre": "X570",
                "socket": "AM4",
                "precio": 3800
            },
            {
                "nombre": "B760",
                "socket": "LGA1700",
                "precio": 2900
            }
        ],

        "ram": [
            {
                "nombre": "16GB DDR4",
                "precio": 1200,
                "watts": 10
            },
            {
                "nombre": "32GB DDR4",
                "precio": 2200,
                "watts": 15
            }
        ],

        "gpu": [
            {
                "nombre": "RTX 4060",
                "precio": 9500,
                "watts": 220,
                "min_fuente": 550
            },
            {
                "nombre": "RTX 4070",
                "precio": 14500,
                "watts": 280,
                "min_fuente": 650
            }
        ],

        "fuente": [
            {
                "nombre": "550W Bronze",
                "watts": 550,
                "precio": 1200
            },
            {
                "nombre": "650W Gold",
                "watts": 650,
                "precio": 1900
            },
            {
                "nombre": "750W Gold",
                "watts": 750,
                "precio": 2600
            }
        ],

        "gabinete": [
            {
                "nombre": "Mid Tower RGB",
                "precio": 1400
            },
            {
                "nombre": "Full Tower Premium",
                "precio": 2500
            },
            {
                "nombre": "Compacto Gamer",
                "precio": 1100
            }
        ],

        "refrigeracion": [
            {
                "nombre": "Aire Básica",
                "precio": 700
            },
            {
                "nombre": "Torre Premium",
                "precio": 1500
            },
            {
                "nombre": "Líquida 240mm",
                "precio": 2800
            }
        ],

        "almacenamiento": [
            {
                "nombre": "SSD 1TB",
                "precio": 1400,
                "watts": 5
            },
            {
                "nombre": "SSD 2TB",
                "precio": 2400,
                "watts": 5
            },
            {
                "nombre": "NVMe 1TB",
                "precio": 1800,
                "watts": 5
            }
        ]
    }