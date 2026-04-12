# Nombre de Proyecto: ArmatuXPC

## Tabla de Contenidos
1. Objetivo
2. Miembros del equipo
3. Tecnologías
4. Instalación
5. Uso
6. Arquitectura
7. Problemas comúnes
8. Puertos

**1.- Objetivo del proyecto**

Desarrollar una plataforma web interactiva que integre un mentor digital con inteligencia artificial y visualización 3D en tiempo real con el fin de orientar y capacitar a los usuarios en el armado, personalización y mantenimiento de computadoras de escritorio, fortaleciendo su confianza, conocimiento técnico y autonomía en el proceso.

**2.- Integrantes**

Romero Escamilla Oscar Eduardo — #22110112

Medina Rubio Eduardo Rafael — #22310398

Soto Rodríguez Bryan Nicolás — #22310373

Corona Gómez Diego Jahir — #22310358

**3.- Tecnologias usadas**

**Lenguaje(s) de programación seleccionados**

**HTML y CSS:** Se usan como base para la estructura y el estilo del módulo de presentación.

**JavaScript:** Importante para la lógica del front-end, la interacción del usuario y la comunicación de datos con el backend.

**Python:** Se utiliza específicamente para el desarrollo del mentor digital (IA), implementando el procesamiento de lenguaje natural (NLP) y las reglas algorítmicas de compatibilidad de hardware.

**C#:** Permite construir la API del módulo de lógica (back-end) principal utilizando ASP.NET Core, manejando la gestión de sesiones y la lógica de negocio central, dada su robustez y rendimiento.

**Frameworks o librerías necesarias**

**React:** El framework principal del front-end para construir la interfaz de usuario de manera modular y escalable.

**Three.js:** Es la librería JavaScript crucial para el renderizado 3D interactivo en el navegador, permitiendo la manipulación de los modelos de componentes de PC.

**Tailwind CSS:** Se utiliza para la maquetación y el diseño rápido de la interfaz.

**ASP.NET Core:** El framework del backend en C# que gestiona la API y la capa de autenticación.

**Versiones específicas de herramientas**

**Cloud Firestore (Firebase):** Servicio en la nube para el almacenamiento de usuarios normales y para su control de tokens de armado.

**Firebase Authentication:** Servicio de autenticación gestionado para manejar el login con correo/contraseña y cuentas de Google.
**Firebase Functions:** Servicio para mayor seguridad en las operaciones del rol administrador de la plataforma web. 
**Firebase Storage:** El servicio de almacenamiento en la nube para alojar los archivos estáticos grandes, específicamente las imagenes de cada tipo de componente de la plataforma.

**PostgreSQL:** La base de datos relacional elegida para almacenar el catálogo de hardware y toda la lógica del negocio.

**Blender:** El software de diseño y modelado 3D esencial para crear los assets de los componentes de PC.

**Control de dependencias**

**npm (Node Package Manager):** Se utiliza para gestionar las dependencias de JavaScript como React o Three.js.

**pip (Python Package Installer):** Se utiliza para gestionar las librerías del Mentor Digital de  IA (Pandas, SciPy, etc.).

**Git & GitHub:** Se usan para el control de versiones y la colaboración. GitHub actúa como el repositorio central y es la plataforma donde se ejecutan los pipelines de CI/CD (GitHub Actions).

**Entorno local para prueba**

**IDE:** Visual Studio Code (VS Code) para la edición y depuración del código.

**Servidores de Despliegue:**

**Vercel:** Plataforma para el hosting del front-end (React) y la distribución rápida a través de CDN.

**Render:** Plataforma para el hosting del back-end (ASP.NET/Python API).

**Funcionamiento local:** Para las pruebas, los servidores de desarrollo de React y ASP.NET/Python se ejecutan localmente, simulando la arquitectura de producción. Esto permite probar la Visualización 3D interactiva y la Validación de Compatibilidad antes de subir el código.

**Herramienta necesaria para el desarrollo y prueba de la aplicación**

**Node.js:** Es un entorno de ejecución de JavaScript de código abierto y multiplataforma que permite ejecutar código JavaScript fuera del navegador, lo que lo hace ideal para desarrollar aplicaciones del servidor y backend. Asimismo, cuenta con librerías, dependencias y gestores de paquetes como “npm” que sirven para la creación, instalación y ejecución de proyectos con frameworks como React.js


**4.- Instrucciones para Clonar y Ejecutar el Proyecto**

**1. Requisitos Previos**

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

Git → https://git-scm.com/downloads

[Lenguaje/Entorno según tu proyecto], por ejemplo:

Node.js → https://nodejs.org/

Python 3.x → https://www.python.org/

Java JDK → https://adoptium.net/

PHP + Servidor local (XAMPP/WAMP)

[Base de datos si aplica]
MySQL, PostgreSQL, MongoDB, etc.

Ajusta esta sección según lo que usa tu proyecto.

**2. Clonar el Repositorio**

Abre una terminal y ejecuta:

git clone https://github.com/usuario/nombre-del-proyecto.git

Luego entra a la carpeta:

cd nombre-del-proyecto

**3. Instalar Dependencias**

**Instalar dependencias frontend**
1. cd frontend-vite
2. npm install
3. npm run dev

**Backend**
1. cd ../backend/ArmatuXPC.Backend
2. dotnet run

**4. Configurar el Archivo de Entorno (Opcional)**

Si tu proyecto utiliza variables de entorno:

Copia el archivo de ejemplo:

cp .env.example .env

Edita el archivo .env con tus credenciales:

Base de datos

Llaves de API

Configuración del servidor

**5. Configurar la Base de Datos (si aplica)**

Para importar un archivo SQL:

Abre phpMyAdmin o tu cliente SQL.

Crea una base de datos.

Importa el archivo:

/database/nombre.sql

**6. Ejecutar el Proyecto**

Para Node.js:

npm start

Para Python:

python main.py

Para Java:

mvn spring-boot:run

Para PHP:

Inicia XAMPP/WAMP

Abre en el navegador:

http://localhost/nombre-del-proyecto

**6. Estructura del Proyecto**

- **ArmatuXPC-Platform/:**  ruta raíz del proyecto
- **backend/ArmatuXPC.Backend:** ruta de todo lo relacionado con la base de datos de PostgreSQL.
- **frontend-vite/:** ruta con todas la interfaces UI del proyecto.
- **IA/:** archivos del modelo de IA para el chatbot.
- **ArmatuXPC-Platform.sln** Archivo de ejecución del proyecto.
- **docker-compose-development.yml:** configuraciones de contenedores de servicios del proyecto, entre ellos la base de datos de manera local.
- **docker-compose-production.yml:** configuraciones de contenedores de servicios del proyecto preparados para el despliegue.
- **firebase.json** configuración de servicio "functions" de firebase.
- **README.md:** archivo de explicación del proyecto.

**7. Problemas Comunes**

**"Permission denied"**

Ejecuta:
chmod +x nombre.sh

**Error de dependencias**

Actualiza node/npm/pip

Reinstala dependencias

**El servidor no inicia**

Revisa el archivo .env

Revisa la configuración de la base de datos

##8. Puertos

- Local (sin Docker): http://localhost:5031/api
- Docker / ZeroTier: http://<IP-LÍDER-DE-EQUIPO>:5000/api








