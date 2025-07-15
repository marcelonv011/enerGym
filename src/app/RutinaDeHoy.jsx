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

        const rutinasConEjerciciosHoy = todasRutinas.filter(
          rutina => rutina.dias?.[hoy]?.length > 0
        );

        setRutinasHoy(rutinasConEjerciciosHoy);

        // Cargar completados
        const completadosTemp = {};
        for (const rutina of rutinasConEjerciciosHoy) {
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

    if (actual.includes(ejercicioNombre)) {
      await deleteDoc(ref);
      setCompletados(prev => ({
        ...prev,
        [rutinaId]: prev[rutinaId].filter(e => e !== ejercicioNombre),
      }));
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
                <button
                  key={i}
                  onClick={() => toggleEjercicio(rutina.id, ejercicio.nombre)}
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

                  {completado ? (
                    <CheckCircle size={24} className="text-emerald-400 transition-all" />
                  ) : (
                    <Circle size={24} className="text-gray-400 transition-all" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
