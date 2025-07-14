// src/app/ListaRutinas.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ListaRutinas() {
  const [rutinas, setRutinas] = useState([]);
  const navigate = useNavigate();

  const obtenerRutinas = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const ref = collection(db, "users", uid, "rutinas");
    const snap = await getDocs(ref);
    const data = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setRutinas(data);
  };

  useEffect(() => {
    obtenerRutinas();
  }, []);

  const eliminarRutina = async (id) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const confirmacion = window.confirm("¿Seguro que quieres eliminar esta rutina?");
    if (!confirmacion) return;

    try {
      await deleteDoc(doc(db, "users", uid, "rutinas", id));
      setRutinas(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Error al eliminar rutina:", err);
      alert("❌ No se pudo eliminar la rutina.");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {rutinas.map((rutina) => (
        <div
          key={rutina.id}
          className="bg-gray-700 p-4 rounded-xl shadow-md transition"
        >
          <div
            onClick={() => navigate(`/rutina/${rutina.id}`)}
            className="cursor-pointer hover:bg-gray-600 p-2 rounded-xl transition"
          >
            <h3 className="text-xl font-bold text-emerald-300">{rutina.nombre}</h3>
            <p className="text-gray-300 text-sm mt-2">{rutina.ejercicios?.length || rutina.dias ? Object.values(rutina.dias).flat().length : 0} ejercicios</p>
          </div>

          <div className="flex mt-4 space-x-2">
            <button
              onClick={() => navigate(`/editar-rutina/${rutina.id}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
              ✏️ Editar
            </button>

            <button
              onClick={() => eliminarRutina(rutina.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
