import { Canvas } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";
import { OrbitControls, useGLTF, useAnimations, Environment } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

function Modelo({ trigger }) {

  const group = useRef();
  const { scene, animations } = useGLTF("/models/Memorias.glb");
  const { actions } = useAnimations(animations, group);

  useEffect(() => {

    if (!actions) return;

    Object.values(actions).forEach((animacion) => {
      animacion.stop();
      animacion.reset();
      animacion.setLoop(THREE.LoopOnce);
      animacion.clampWhenFinished = true;
      animacion.fadeIn(0.3).play();
    });

  }, [trigger, actions]);

  return (
    <primitive
      ref={group}
      object={scene}
      scale={1.2}
      position={[0, -1, 0]}
    />
  );
}

export default function Vision() {

  const navigate = useNavigate();
  const [trigger, setTrigger] = useState(0);
  const [modo, setModo] = useState("instalar");

  // 🔵 PASOS PARA INSTALAR DISCO DURO
  const pasosInstalar = [
    "Apagar completamente la computadora.",
    "Desconectar el cable de corriente.",
    "Abrir el gabinete retirando el panel lateral.",
    "Ubicar la bahía para discos duros (HDD/SSD).",
    "Colocar el disco duro en la bahía correspondiente.",
    "Alinear los orificios del disco con los del soporte.",
    "Atornillar el disco firmemente.",
    "Conectar el cable SATA al disco.",
    "Conectar el otro extremo del cable SATA a la placa madre.",
    "Conectar el cable de alimentación SATA desde la fuente de poder.",
    "Cerrar el gabinete.",
    "Encender el equipo y verificar que el disco sea reconocido en la BIOS o sistema operativo."
  ];

  // 🔴 PASOS PARA DESINSTALAR DISCO DURO
  const pasosDesinstalar = [
    "Apagar completamente la computadora.",
    "Desconectar el cable de corriente.",
    "Abrir el gabinete.",
    "Ubicar el disco duro instalado.",
    "Desconectar el cable de alimentación SATA.",
    "Desconectar el cable de datos SATA.",
    "Retirar los tornillos que sujetan el disco.",
    "Sujetar el disco firmemente.",
    "Extraer el disco cuidadosamente de la bahía.",
    "Retirar completamente el disco del gabinete."
  ];

  const pasos = modo === "instalar" ? pasosInstalar : pasosDesinstalar;

  return (

    <div className="min-h-screen bg-linear-to-b from-[#0f172a] via-[#1e3a8a] to-[#0f172a] text-white flex flex-col p-6">
      {/* 🔹 BOTONES SUPERIORES */}
      <div className="relative flex items-center justify-between mb-6">

        {/* IZQUIERDA → RAM */}
        <button
          onClick={() => navigate("/Ram")}
          className="px-6 py-2 bg-linear-to-r from-emerald-500 to-teal-600 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/30"
        >
          🧩 RAM
        </button>

        {/* CENTRO → ÍNDICE */}
        <button
          onClick={() => navigate("/Indice")}
          className="absolute left-1/2 transform -translate-x-1/2 px-6 py-2 bg-linear-to-r from-purple-500 to-indigo-600 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-purple-500/30"
        >
          📑 Índice
        </button>

        {/* DERECHA → FUENTE DE PODER */}
        <button
          onClick={() => navigate("/fuente")}
          className="px-6 py-2 bg-linear-to-r from-orange-500 to-red-600 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-orange-500/30"
        >
          🔌 Fuente de Poder
        </button>

      </div>

      <div className="w-full max-w-7xl mx-auto grid grid-cols-2 gap-8">

        {/* PANEL IZQUIERDO */}
        <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-slate-700/50 shadow-[0_0_40px_rgba(0,255,255,0.05)]">

          <h2 className="text-3xl font-extrabold mb-6 text-white">
            Disco Duro (HDD / SSD)
          </h2>

          <p className="text-lg text-slate-400 mb-6">
            {modo === "instalar" ? "Proceso de Instalación" : "Proceso de Desinstalación"}
          </p>

          <div className="flex gap-4 mb-6">

            <button
              onClick={() => setModo("instalar")}
              className={`px-5 py-2 rounded-xl font-semibold transition-all duration-300 ${
                modo === "instalar"
                  ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Instalar
            </button>

            <button
              onClick={() => setModo("desinstalar")}
              className={`px-5 py-2 rounded-xl font-semibold transition-all duration-300 ${
                modo === "desinstalar"
                  ? "bg-linear-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30 scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              Desinstalar
            </button>

          </div>

          <ol className="space-y-3 text-slate-200">

            {pasos.map((paso, index) => (
              <li
                key={index}
                className="bg-slate-800/70 p-4 rounded-xl border border-slate-700/40 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-md"
              >
                <span className="text-cyan-400 font-bold">
                  Paso {index + 1}:
                </span>{" "}
                {paso}
              </li>
            ))}

          </ol>

        </div>

        {/* PANEL DERECHO */}
        <div className="bg-slate-900/60 backdrop-blur-2xl p-8 rounded-3xl border border-slate-700/50 shadow-[0_0_40px_rgba(0,255,255,0.05)]">

          <div className="flex justify-between items-center mb-6">

            <h2 className="text-3xl font-extrabold text-white">
              Visor 3D
            </h2>

            <button
              onClick={() => setTrigger(prev => prev + 1)}
              className="px-6 py-2 bg-linear-to-r from-cyan-500 to-blue-600 rounded-xl text-white font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/30"
            >
              ▶ Reproducir Animación
            </button>

          </div>

          <div className="w-full h-125 rounded-2xl overflow-hidden border border-slate-700/50 shadow-inner">

            <Canvas camera={{ position: [-4, 2, -10], fov: 60 }}>

              <color attach="background" args={["#020617"]} />

              <ambientLight intensity={1.5} />
              <directionalLight position={[5, 5, 5]} intensity={2} />
              <spotLight position={[-5, 5, 5]} intensity={1} />

              <Modelo trigger={trigger} />

              <OrbitControls target={[0, 1, 0]} />
              <Environment preset="city" />

            </Canvas>

          </div>

          <div className="mt-4 p-4 bg-slate-800/70 border border-slate-700/50 rounded-xl shadow-md text-slate-200 text-sm text-center">
            <strong className="block mb-2 text-cyan-400">Instrucciones del Visor 3D</strong>
            <ul className="list-disc list-inside space-y-1">
            <li className="flex items-center gap-2">
  🖱️ <span><strong>Clic izquierdo:</strong> mover la vista de la cámara.</span>
</li>

<li className="flex items-center gap-2">
  🖱️ <span><strong>Clic derecho:</strong> mover la posición de la cámara.</span>
</li>

<li className="flex items-center gap-2">
  🔍 <span><strong>Rueda:</strong> zoom o alejar la cámara.</span>
</li>
            </ul>
          </div>

        </div>

      </div>

    </div>

  );
}