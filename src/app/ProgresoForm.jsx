import React, { useState } from "react";
import { db, auth } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default function ProgresoForm() {
  const [progreso, setProgreso] = useState("");
  const [mensaje, setMensaje] = useState("");

  const registrarProgreso = async () => {
    const uid = auth.currentUser.uid;
    const hoy = new Date().toISOString().split("T")[0]; // yyyy-mm-dd
    try {
      await setDoc(doc(db, "users", uid, "progreso", hoy), {
        texto: progreso,
        fecha: hoy
      });
      setMensaje("✅ Progreso guardado");
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al guardar progreso");
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-emerald-400 mb-2">📈 Registrar progreso</h3>
      <textarea
        value={progreso}
        onChange={(e) => setProgreso(e.target.value)}
        rows={5}
        placeholder="Hoy hice 4 series de pecho con 60kg..."
        className="w-full p-2 rounded bg-gray-700 text-white mb-3"
      />
      <button
        onClick={registrarProgreso}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded font-semibold"
      >
        Guardar progreso
      </button>
      {mensaje && <p className="mt-2 text-sm text-gray-300">{mensaje}</p>}
    </div>
  );
}
