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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6 py-10 flex flex-col items-center">
      {/* Contenedor principal */}
      <div className="w-full max-w-5xl bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-3xl p-10 shadow-2xl border border-gray-700">
        
        {/* Header superior */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-emerald-400 drop-shadow tracking-tight select-none">
            🏋️ Energym Rutinas
          </h1>
          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 transition-all px-5 py-2 rounded-full text-sm font-bold shadow-md active:scale-95"
          >
            🔒 Cerrar sesión
          </button>
        </div>

        {/* Botón crear rutina */}
        <div className="flex justify-center mb-10">
          <button
            onClick={() => navigate("/crear-rutina")}
            className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-all duration-300 ease-in-out text-white py-4 px-8 rounded-full text-lg font-semibold shadow-lg shadow-emerald-600/30 hover:shadow-emerald-700/50"
          >
            ➕ Crear nueva rutina
          </button>
        </div>

        {/* Lista de rutinas */}
        <ListaRutinas />

        {/* Mensaje al final */}
        <p className="mt-10 text-center text-sm text-gray-400 italic">
          Aquí aparecerán todas tus rutinas personalizadas por día 📅
        </p>
      </div>
    </div>
  );
}
