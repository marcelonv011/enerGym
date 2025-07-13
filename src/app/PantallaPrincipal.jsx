import React from "react";
import RutinaForm from "./RutinaForm";
import ProgresoForm from "./ProgresoForm";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function PantallaPrincipal() {
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-emerald-400">🏋️ Energym</h1>
          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
          >
            Cerrar sesión
          </button>
        </div>

        <p className="text-gray-300 mb-6 text-sm">
          Bienvenido/a a tu panel de entrenamiento. Agregá rutinas y registrá tu progreso.
        </p>

        <RutinaForm />
        <div className="my-6 border-t border-gray-600"></div>
        <ProgresoForm />
      </div>
    </div>
  );
}
