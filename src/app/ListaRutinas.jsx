import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ListaRutinas() {
  const [rutinas, setRutinas] = useState([]);
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, idRutina: null });
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

  const abrirModalEliminar = (id) => {
    setModalEliminar({ abierto: true, idRutina: id });
  };

  const cerrarModalEliminar = () => {
    setModalEliminar({ abierto: false, idRutina: null });
  };

  const confirmarEliminar = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !modalEliminar.idRutina) {
      cerrarModalEliminar();
      return;
    }

    try {
      await deleteDoc(doc(db, "users", uid, "rutinas", modalEliminar.idRutina));
      setRutinas(prev => prev.filter(r => r.id !== modalEliminar.idRutina));
      cerrarModalEliminar();
    } catch (err) {
      console.error("Error al eliminar rutina:", err);
      alert("❌ No se pudo eliminar la rutina.");
      cerrarModalEliminar();
    }
  };

  return (
    <>
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
              <p className="text-gray-300 text-sm mt-2">
                {rutina.ejercicios?.length || rutina.dias ? Object.values(rutina.dias).flat().length : 0} ejercicios
              </p>
            </div>

            <div className="flex mt-4 space-x-2">
              <button
                onClick={() => navigate(`/editar-rutina/${rutina.id}`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                ✏️ Editar
              </button>

              <button
                onClick={() => abrirModalEliminar(rutina.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación */}
      {modalEliminar.abierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50 p-4"
          onClick={cerrarModalEliminar}
        >
          <div
            className="bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-semibold text-red-400 mb-6">
              ¿Seguro que querés eliminar esta rutina?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={confirmarEliminar}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg font-bold shadow-md active:scale-95"
              >
                Sí, eliminar
              </button>
              <button
                onClick={cerrarModalEliminar}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-md active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
