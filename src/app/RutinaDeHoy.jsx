import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { CheckCircle, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function RutinaDeHoy() {
  const [rutinasHoy, setRutinasHoy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completados, setCompletados] = useState({});

  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long" }).toLowerCase();
  const fechaHoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchRutinasHoy = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const rutinasRef = collection(db, "users", uid, "rutinas");
        const snapshot = await getDocs(rutinasRef);

        const todasRutinas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // FILTRAR sólo la rutina activa con ejercicios para hoy
        const rutinasActivas = todasRutinas.filter(
          (rutina) => rutina.activa && rutina.dias?.[hoy]?.length > 0
        );

        setRutinasHoy(rutinasActivas);

        // Cargar ejercicios completados para la rutina activa y fecha de hoy
        const completadosTemp = {};
        for (const rutina of rutinasActivas) {
          const compRef = collection(db, "users", uid, "rutinas", rutina.id, "completados");
          const q = query(compRef, where("fecha", "==", fechaHoy));
          const compSnap = await getDocs(q);
          completadosTemp[rutina.id] = compSnap.docs.map(doc => doc.data().ejercicio);
        }

        setCompletados(completadosTemp);
      } catch (err) {
        console.error("Error al obtener datos:", err);
        setRutinasHoy([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinasHoy();
  }, [hoy]);

  const toggleEjercicio = async (rutinaId, ejercicioNombre) => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const actual = completados[rutinaId] || [];
    const docId = `${fechaHoy}-${ejercicioNombre.replace(/\s+/g, "_")}`;

    const ref = doc(db, "users", uid, "rutinas", rutinaId, "completados", docId);

    try {
      if (actual.includes(ejercicioNombre)) {
        await deleteDoc(ref);
        setCompletados(prev => ({
          ...prev,
          [rutinaId]: prev[rutinaId].filter(e => e !== ejercicioNombre),
        }));

        toast.error(`❌ Ejercicio "${ejercicioNombre}" desmarcado`);
      } else {
        await setDoc(ref, {
          ejercicio: ejercicioNombre,
          fecha: fechaHoy,
          creada: new Date(),
        });
        setCompletados(prev => ({
          ...prev,
          [rutinaId]: [...(prev[rutinaId] || []), ejercicioNombre],
        }));

        toast.success(`✅ "${ejercicioNombre}" completado`);
      }
    } catch (err) {
      console.error("Error al actualizar ejercicio completado:", err);
      toast.error("❌ Error al actualizar ejercicio");
    }
  };

  if (loading) return <p className="text-gray-400">Cargando rutinas de hoy...</p>;

  if (rutinasHoy.length === 0)
    return (
      <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-emerald-400 mb-3">📅 Rutinas de hoy</h2>
        <p className="text-gray-400">No hay ejercicios asignados para hoy.</p>
      </div>
    );

  return (
    <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-emerald-400 mb-6">📅 Rutinas para hoy</h2>

      {rutinasHoy.map(rutina => (
        <div key={rutina.id} className="mb-8">
          <h3 className="text-xl font-semibold text-emerald-300 mb-4">{rutina.nombre}</h3>

          <div className="flex flex-col gap-3">
            {rutina.dias[hoy].map((ejercicio, i) => {
              const completado = completados[rutina.id]?.includes(ejercicio.nombre);

              return (
                <motion.button
                  key={i}
                  onClick={() => toggleEjercicio(rutina.id, ejercicio.nombre)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border border-gray-700 transition-all ${
                    completado
                      ? "bg-emerald-600/20 hover:bg-emerald-600/30"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  <span
                    className={`text-lg font-medium transition-all ${
                      completado ? "line-through text-gray-400" : "text-white"
                    }`}
                  >
                    {ejercicio.nombre}
                  </span>

                  <AnimatePresence mode="wait" initial={false}>
                    {completado ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <CheckCircle size={24} className="text-emerald-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="circle"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <Circle size={24} className="text-gray-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
