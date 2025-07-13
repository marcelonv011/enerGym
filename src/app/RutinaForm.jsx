import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RutinaForm() {
  const [dia, setDia] = useState("lunes");
  const [ejercicios, setEjercicios] = useState("");
  const [mensaje, setMensaje] = useState("");

  const guardarRutina = async () => {
    const uid = auth.currentUser.uid;
    try {
      await setDoc(doc(db, "users", uid, "rutinas", dia), {
        ejercicios: ejercicios.split("\n"), // array por salto de línea
        timestamp: new Date()
      });
      setMensaje("✅ Rutina guardada para " + dia);
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg mb-6">
      <h3 className="text-xl font-bold text-emerald-400 mb-2">📅 Crear rutina</h3>
      <select
        value={dia}
        onChange={(e) => setDia(e.target.value)}
        className="mb-2 px-3 py-2 rounded bg-gray-700 text-white"
      >
        {["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <textarea
        value={ejercicios}
        onChange={(e) => setEjercicios(e.target.value)}
        rows={5}
        placeholder="Sentadillas 4x12\nCardio 20min"
        className="w-full p-2 rounded bg-gray-700 text-white mb-3"
      />
      <button
        onClick={guardarRutina}
        className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded font-semibold"
      >
        Guardar rutina
      </button>
      {mensaje && <p className="mt-2 text-sm text-gray-300">{mensaje}</p>}
    </div>
  );
}
