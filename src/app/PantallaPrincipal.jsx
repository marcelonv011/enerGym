import React from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import ListaRutinas from "./ListaRutinas";


export default function PantallaPrincipal() {
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-start p-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-3xl mt-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-400">🏋️ Mis Rutinas</h1>
          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>

        <button
          onClick={() => navigate("/crear-rutina")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-5 rounded-lg font-semibold shadow-md mb-6"
        >
          ➕ Crear nueva rutina
        </button>

        {/* Aquí irá el componente de lista de rutinas con cards */}
          <ListaRutinas />
        <p className="text-gray-400 text-sm">Aquí aparecerán tus rutinas guardadas...</p>
      </div>
    </div>
  );
}
