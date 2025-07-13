import React from "react";
import RutinaForm from "./RutinaForm";
import ProgresoForm from "./ProgresoForm";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function PantallaPrincipal() {
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      alert("Error al cerrar sesión: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col items-center justify-center p-6">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-3xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-extrabold text-emerald-400 tracking-wide select-none">
            🏋️ Energym
          </h1>
          <button
            onClick={cerrarSesion}
            className="bg-red-600 hover:bg-red-700 transition-colors duration-300 px-5 py-2 rounded-full text-sm font-semibold shadow-md active:scale-95"
          >
            Cerrar sesión
          </button>
        </header>

        <p className="text-gray-300 mb-8 text-base sm:text-lg">
          Bienvenido/a a tu panel de entrenamiento. Agregá rutinas y registrá tu progreso.
        </p>

        <RutinaForm />
        <hr className="my-10 border-gray-600" />
        <ProgresoForm />
      </div>
    </div>
  );
}
