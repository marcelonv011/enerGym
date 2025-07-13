import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ProgresoForm() {
  const [progreso, setProgreso] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const registrarProgreso = async () => {
    if (!progreso.trim()) {
      setMensaje("❌ Por favor, escribí tu progreso antes de guardar.");
      return;
    }
    setCargando(true);
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setMensaje("❌ Usuario no autenticado.");
      setCargando(false);
      return;
    }
    const hoy = new Date().toISOString().split("T")[0];
    try {
      await setDoc(doc(db, "users", uid, "progreso", hoy), {
        texto: progreso,
        fecha: hoy
      });
      setMensaje("✅ Progreso guardado");
      setProgreso("");
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar progreso");
    }
    setCargando(false);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg">
      <h3 className="text-2xl font-bold text-emerald-400 mb-4">📈 Registrar progreso</h3>
      <textarea
        value={progreso}
        onChange={(e) => setProgreso(e.target.value)}
        rows={6}
        placeholder="Hoy hice 4 series de pecho con 60kg..."
        className="w-full p-4 rounded bg-gray-700 text-white mb-5 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
        disabled={cargando}
      />
      <button
        onClick={registrarProgreso}
        disabled={cargando}
        className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded font-semibold transition-all duration-200 shadow-md active:scale-95 disabled:opacity-50`}
      >
        {cargando ? "Guardando..." : "Guardar progreso"}
      </button>
      {mensaje && <p className="mt-3 text-sm text-gray-300 select-none">{mensaje}</p>}
    </div>
  );
}
