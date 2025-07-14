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
    <div className="min-h-screen bg-gray-900 text-white p-6 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-emerald-400">➕ Crear nueva rutina</h1>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la rutina"
          className="w-full p-3 rounded bg-gray-700 text-white mb-6"
        />

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={diaSeleccionado}
            onChange={(e) => setDiaSeleccionado(e.target.value)}
            className="p-3 rounded bg-gray-700 text-white w-full sm:w-1/3"
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
            className="p-3 rounded bg-gray-700 text-white w-full sm:w-1/3"
          />

          <input
            type="text"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            placeholder="Link YouTube (opcional)"
            className="p-3 rounded bg-gray-700 text-white w-full sm:w-1/3"
          />
        </div>

        <button
          onClick={agregarEjercicio}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded font-semibold mb-6"
        >
          Agregar ejercicio al día
        </button>

        {Object.entries(dias).map(([dia, ejercicios]) => (
          <div key={dia} className="mb-4">
            <h3 className="text-xl font-bold text-emerald-300 capitalize">{dia}</h3>
            <ul className="text-gray-300 list-disc ml-5 mt-1">
              {ejercicios.map((e, i) => (
                <li key={i}>
                  {e.nombre}
                  {e.videoURL && (
                    <span className="text-xs text-blue-400 ml-2">(video)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {mensaje && <p className="text-sm text-red-400 mt-4">{mensaje}</p>}

        <button
          onClick={guardarRutina}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-6 py-3 rounded font-semibold"
        >
          Guardar rutina
        </button>
      </div>
    </div>
  );
}
