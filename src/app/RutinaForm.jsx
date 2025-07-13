import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RutinaForm() {
  const [dia, setDia] = useState("lunes");
  const [ejercicios, setEjercicios] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const guardarRutina = async () => {
    if (!ejercicios.trim()) {
      setMensaje("❌ Por favor, escribí al menos un ejercicio.");
      return;
    }
    setCargando(true);
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setMensaje("❌ Usuario no autenticado.");
      setCargando(false);
      return;
    }

    try {
      await setDoc(doc(db, "users", uid, "rutinas", dia), {
        ejercicios: ejercicios.split("\n").filter(line => line.trim() !== ""),
        timestamp: new Date()
      });
      setMensaje("✅ Rutina guardada para " + dia);
      setEjercicios(""); // limpiar campo
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar");
    }
    setCargando(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
      <h3 className="text-2xl font-bold text-emerald-400 mb-4">📅 Crear rutina</h3>
      <select
        value={dia}
        onChange={(e) => setDia(e.target.value)}
        className="mb-4 px-4 py-3 rounded bg-gray-700 text-white w-full"
      >
        {["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <textarea
        value={ejercicios}
        onChange={(e) => setEjercicios(e.target.value)}
        rows={6}
        placeholder="Sentadillas 4x12\nCardio 20min"
        className="w-full p-4 rounded bg-gray-700 text-white mb-5 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
        disabled={cargando}
      />
      <button
        onClick={guardarRutina}
        disabled={cargando}
        className={`w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded font-semibold transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50`}
      >
        {cargando ? "Guardando..." : "Guardar rutina"}
      </button>
      {mensaje && <p className="mt-3 text-sm text-gray-300 select-none">{mensaje}</p>}
    </div>
  );
}
