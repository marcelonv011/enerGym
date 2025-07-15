import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function ListaRutinas() {
  const [rutinas, setRutinas] = useState([]);
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, idRutina: null });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const obtenerRutinas = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setLoading(true);
    try {
      const ref = collection(db, "users", uid, "rutinas");
      const snap = await getDocs(ref);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRutinas(data);
    } catch (error) {
      console.error("Error al obtener rutinas:", error);
      setRutinas([]);
    } finally {
      setLoading(false);
    }
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

  const activarRutina = async (rutinaId) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    try {
      // Desactivar todas las rutinas
      const ref = collection(db, "users", uid, "rutinas");
      const snapshot = await getDocs(ref);

      const updates = snapshot.docs.map(docSnap =>
        updateDoc(doc(db, "users", uid, "rutinas", docSnap.id), { activa: false })
      );

      await Promise.all(updates);

      // Activar la rutina seleccionada
      await updateDoc(doc(db, "users", uid, "rutinas", rutinaId), { activa: true });

      // Refrescar la lista para mostrar cambios
      await obtenerRutinas();
    } catch (err) {
      console.error("Error al activar rutina:", err);
      alert("❌ No se pudo activar la rutina");
    }
  };

  if (loading) {
    return <p className="text-gray-400 text-center mt-6">Cargando rutinas...</p>;
  }

  if (rutinas.length === 0) {
    return <p className="text-gray-400 text-center mt-6">No tienes rutinas creadas aún.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {rutinas.map((rutina) => (
          <div
            key={rutina.id}
            className={`bg-gray-700 p-4 rounded-xl shadow-md transition ${
              rutina.activa ? "border-2 border-emerald-500" : ""
            }`}
          >
            <div
              onClick={() => navigate(`/rutina/${rutina.id}`)}
              className="cursor-pointer hover:bg-gray-600 p-2 rounded-xl transition"
            >
              <h3 className={`text-xl font-bold ${rutina.activa ? "text-emerald-300" : "text-white"}`}>
                {rutina.nombre}
              </h3>
              <p className="text-gray-300 text-sm mt-2">
                {rutina.dias
                  ? Object.values(rutina.dias).flat().length
                  : 0} ejercicios
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
              <AnimatePresence>
                {rutina.activa && (
                  <motion.p
                    key="texto-activa"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-emerald-400 font-semibold text-sm select-none"
                  >
                    Esta rutina está activa y se mostrará en "Rutinas de hoy"
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex space-x-2">
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

                <button
                  onClick={() => activarRutina(rutina.id)}
                  disabled={rutina.activa}
                  className={`px-4 py-1 rounded text-sm font-bold transition ${
                    rutina.activa
                      ? "bg-emerald-600 text-white cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
                  }`}
                >
                  {rutina.activa ? "Activa" : "Activar"}
                </button>
              </div>
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
