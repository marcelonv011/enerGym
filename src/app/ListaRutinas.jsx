// src/app/ListaRutinas.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {rutinas.map((rutina) => (
        <div
          key={rutina.id}
          className="bg-gray-700 p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-600 transition"
          onClick={() => navigate(`/rutina/${rutina.id}`)}
        >
          <h3 className="text-xl font-bold text-emerald-300">{rutina.nombre}</h3>
          <p className="text-gray-300 text-sm mt-2">{rutina.ejercicios?.length || 0} ejercicios</p>
        </div>
      ))}
    </div>
  );
}
