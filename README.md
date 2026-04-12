# 🚀 ArmatuXPC

Plataforma web interactiva para el armado de computadoras personalizadas, con mentor digital basado en IA y visualización 3D en tiempo real.

🧠 **Objetivo**

Desarrollar una plataforma que permita a los usuarios:

- 🖥️ Simular el armado de una PC
- 🤖 Recibir asesoramiento inteligente (IA)
- 🔧 Validar compatibilidad de componentes
- 📊 Aprender de forma interactiva
- ✨ Features
- 🔍 Validación de compatibilidad de hardware en tiempo real
- 🧠 Mentor digital con IA (NLP + reglas)
- 🎮 Visualización 3D con Three.js
- 🔐 Autenticación con Firebase
- 📦 Gestión de catálogo de componentes
- ☁️ Persistencia en PostgreSQL + Firestore

**🏗️ Arquitectura**
Frontend (React + Vite + Three.js)
        ↓
        
Backend API (ASP.NET Core)
        ↓
        
PostgreSQL (datos principales)
        ↓
        
Firebase (Auth + Storage + Functions)
        ↓
        
IA Service (Ollama - NLP + lógica de reglas de compatibilidad)

**🛠️ Tecnologías**
**Frontend**
- React
T- ailwind CSS
- Three.js
**Backend:**:
- ASP.NET Core (C#)
- Tokens de nuevos armados / Monitoreo y logística
- JavaScript + API REST (NLP, reglas de compatibilidad)
**Base de datos:**
- PostgreSQL
- Firebase (Auth, Firestore, Storage)
**DevOps:**
- Docker
- GitHub Actions
- Vercel (frontend)
- Render (backend)

**👥 Equipo**
- Oscar Eduardo Romero Escamilla
- Eduardo Rafael Medina Rubio
- Bryan Nicolás Soto Rodríguez
- Diego Jahir Corona Gómez

**⚙️ Instalación**
1. Clonar repositorio
- git clone https://github.com/usuario/armatuxpc.git
- cd armatuxpc
2. Frontend
- cd frontend-vite
- npm install
- npm run dev
3. Backend
- cd backend/ArmatuXPC.Backend
- dotnet run (local), dotnet run --urls=http://0.0.0.0:5000 (equipo)
4. Docker
  - docker compose -f docker-compose-development.yml up --build (crear pila de contenedores)
    
**📂 Estructura del proyecto**

ArmatuXPC/
│

├── frontend-vite/

├── backend/

│   └── ArmatuXPC.Backend/

├── IA/

├── docker-compose-development.yml

├── docker-compose-production.yml

└── README.md

**🚨 Problemas comunes**
❌ Error de dependencias
- npm install
- pip install -r requirements.txt
❌ Backend no inicia
- Revisar .env
- Revisar conexión a PostgreSQL
❌ Docker falla
- docker compose down
- docker compose up --build

**🌐 Puertos**
[Locales (de momento)]
- Backend: http://localhost:5031/api
- Frontend: http://localhost:5173
- Docker: http://localhost:5000/api

**🚀 Despliegue**
Frontend: Vercel
Backend: Render
