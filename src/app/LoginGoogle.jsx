// src/app/LoginGoogle.jsx
import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import google from "../assets/google.png";

export default function LoginGoogle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setError("Error al iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 flex flex-col justify-center items-center px-6">
      <div className="bg-gray-800 rounded-3xl shadow-xl p-12 max-w-md w-full text-center">
        <h1 className="text-5xl font-extrabold mb-8 text-white tracking-wide">Energym</h1>
        <p className="text-gray-300 mb-12 text-lg font-medium">
          ¡Bienvenido! Inicia sesión para comenzar tu progreso en el gym.
        </p>

        {error && (
          <div className="mb-6 text-red-500 font-semibold text-sm">{error}</div>
        )}
         <div className="bg-red-500 text-white p-4 font-bold">
      ¡Si ves este fondo rojo, Tailwind funciona!
    </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-4 w-full bg-pink-600 hover:bg-pink-700 active:bg-pink-800 transition text-white rounded-xl py-4 px-6 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-xl"
        >
          <img src={google} alt="Google Logo" className="w-7 h-7" />
          {loading ? "Cargando..." : "Iniciar sesión con Google"}
        </button>
      </div>
    </div>
  );
}
