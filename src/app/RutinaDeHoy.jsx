import React, { useEffect, useState, useContext } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { CheckCircle, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RutinaActivaContext } from "./RutinaActivaContext";

export default function RutinaDeHoy() {
  const { rutinaActivaId, loading: loadingRutinaActiva } = useContext(RutinaActivaContext);
  const [rutina, setRutina] = useState(null);
  const [completados, setCompletados] = useState({});
  const [loading, setLoading] = useState(true);

  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long" }).toLowerCase();
  const fechaHoy = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchRutina = async () => {
      if (!rutinaActivaId) {
        setRutina(null);
        setLoading(false);
        return;
      }
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      setLoading(true);
      try {
        const ref = doc(db, "users", uid, "rutinas", rutinaActivaId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setRutina({ id: snap.id, ...snap.data() });

          // Cargar ejercicios completados
          const compRef = collection(db, "users", uid, "rutinas", rutinaActivaId, "completados");
          const q = query(compRef, where("fecha", "==", fechaHoy));
          const compSnap = await getDocs(q);
          setCompletados({
            [rutinaActivaId]: compSnap.docs.map(doc => doc.data().ejercicio),
          });
        } else {
          setRutina(null);
        }
      } catch (err) {
        console.error("Error al obtener rutina:", err);
        setRutina(null);
      } finally {
        setLoading(false);
      }
    };

    if (!loadingRutinaActiva) {
      fetchRutina();
    }
  }, [rutinaActivaId, loadingRutinaActiva]);

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

  if (loading || loadingRutinaActiva) return <p className="text-gray-400">Cargando rutina activa...</p>;

  if (!rutina) return (
    <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-emerald-400 mb-3">📅 Rutinas de hoy</h2>
      <p className="text-gray-400">No hay rutina activa seleccionada.</p>
    </div>
  );

  if (!rutina.dias?.[hoy]?.length) return (
    <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-emerald-400 mb-3">📅 Rutinas de hoy</h2>
      <p className="text-gray-400">No hay ejercicios asignados para hoy en la rutina activa.</p>
    </div>
  );

  return (
    <div className="bg-gray-800 p-6 rounded-xl mb-8 shadow-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-emerald-400 mb-6">📅 Rutina activa: {rutina.nombre}</h2>

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
  );
}
