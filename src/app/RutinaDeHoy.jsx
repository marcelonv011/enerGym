import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function RutinaDeHoy() {
  const [rutinasHoy, setRutinasHoy] = useState([]);
  const [loading, setLoading] = useState(true);

  // Defino hoy aquí para que esté disponible en todo el componente
  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long" }).toLowerCase();

  useEffect(() => {
    const fetchRutinasHoy = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const rutinasRef = collection(db, "users", uid, "rutinas");
        const snapshot = await getDocs(rutinasRef);

        if (snapshot.empty) {
          setRutinasHoy([]);
          setLoading(false);
          return;
        }

        const todasRutinas = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filtramos sólo las rutinas que tienen ejercicios para hoy
        const rutinasConEjerciciosHoy = todasRutinas.filter(rutina => rutina.dias?.[hoy]?.length > 0);

        setRutinasHoy(rutinasConEjerciciosHoy);
      } catch (err) {
        console.error("Error al obtener las rutinas de hoy:", err);
        setRutinasHoy([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRutinasHoy();
  }, [hoy]); // opcional poner hoy como dependencia

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
        <div key={rutina.id} className="mb-6">
          <h3 className="text-xl font-semibold text-emerald-300 mb-2">{rutina.nombre}</h3>
          <ul className="list-disc list-inside text-gray-200 space-y-1">
            {rutina.dias[hoy].map((ejercicio, i) => (
              <li key={i}>{ejercicio.nombre}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
