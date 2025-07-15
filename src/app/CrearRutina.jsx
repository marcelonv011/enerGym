import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export default function CrearRutina() {
  const [nombre, setNombre] = useState("");
  const [dias, setDias] = useState({
    lunes: [],
    martes: [],
    miércoles: [],
    jueves: [],
    viernes: [],
    sábado: [],
    domingo: [],
  });

  const [nuevoEjercicio, setNuevoEjercicio] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState("lunes");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const agregarEjercicio = () => {
    if (!nuevoEjercicio.trim()) return;

    setDias((prev) => ({
      ...prev,
      [diaSeleccionado]: [
        ...prev[diaSeleccionado],
        {
          nombre: nuevoEjercicio,
          videoURL: videoURL.trim() || null,
        },
      ],
    }));

    setNuevoEjercicio("");
    setVideoURL("");
  };

  const guardarRutina = async () => {
    if (!nombre.trim()) {
      setMensaje("❌ Debes poner un nombre a la rutina.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setMensaje("❌ Usuario no autenticado.");
      return;
    }

    const id = Date.now().toString();

    try {
      await setDoc(doc(collection(db, "users", uid, "rutinas"), id), {
        nombre,
        dias,
        creada: new Date(),
      });
      navigate("/");
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al guardar rutina.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-700">
        
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-500 transition font-semibold self-start"
          >
            ← Volver
          </button>

          <h1 className="text-4xl font-extrabold text-emerald-400 tracking-tight text-center">
            ➕ Crear nueva rutina
          </h1>
        </div>

        {/* Nombre rutina */}
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la rutina"
          className="w-full p-4 rounded-xl bg-gray-800 text-white mb-6 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* Form agregar ejercicio */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <select
            value={diaSeleccionado}
            onChange={(e) => setDiaSeleccionado(e.target.value)}
            className="p-4 rounded-xl bg-gray-800 text-white w-full sm:w-1/4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {Object.keys(dias).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={nuevoEjercicio}
            onChange={(e) => setNuevoEjercicio(e.target.value)}
            placeholder="Ejercicio (Ej: Sentadillas 4x12)"
            className="p-4 rounded-xl bg-gray-800 text-white w-full sm:w-2/4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="text"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            placeholder="Link YouTube (opcional)"
            className="p-4 rounded-xl bg-gray-800 text-white w-full sm:w-1/4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={agregarEjercicio}
          className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-all py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-emerald-700/50 active:scale-95 mb-8"
        >
          ➕ Agregar ejercicio al día
        </button>

        {/* Mostrar ejercicios por día */}
        <div className="space-y-6">
          {Object.entries(dias).map(([dia, ejercicios]) => (
            <div key={dia}>
              <h3 className="text-xl font-bold text-emerald-300 capitalize mb-2">{dia}</h3>
              {ejercicios.length === 0 ? (
                <p className="text-gray-500 text-sm ml-2">Sin ejercicios.</p>
              ) : (
                <ul className="text-gray-300 list-disc ml-6 mt-1 space-y-1">
                  {ejercicios.map((e, i) => (
                    <li key={i}>
                      {e.nombre}
                      {e.videoURL && <span className="text-xs text-blue-400 ml-2">(video)</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        {mensaje && <p className="text-sm text-red-400 mt-6 text-center">{mensaje}</p>}

        <button
          onClick={guardarRutina}
          className="w-full bg-blue-500 hover:bg-blue-600 transition-all text-white mt-8 py-4 rounded-full text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-700/50 active:scale-95"
        >
          💾 Guardar rutina
        </button>
      </div>
    </div>
  );
}
