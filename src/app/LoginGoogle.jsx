import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import google from "../assets/google.png";
import { useNavigate } from "react-router-dom";

export default function LoginGoogle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/"); // redirige a la pantalla principal
    } catch (err) {
      console.error(err); // muestra el error exacto en la consola
      setError("Error al iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-800 to-green-700 flex flex-col justify-center items-center px-6">
      <div className="bg-gray-800 rounded-3xl shadow-2xl p-12 max-w-md w-full text-center">
        <h1 className="text-5xl font-extrabold mb-8 text-green-400 tracking-wide">
          Energym
        </h1>
        <p className="text-gray-300 mb-12 text-lg font-medium">
          ¡Bienvenido! Inicia sesión para comenzar tu progreso en el gym.
        </p>

        {error && (
          <div className="mb-6 text-red-500 font-semibold text-sm">{error}</div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-4 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 transition-all duration-200 ease-in-out text-white rounded-xl py-4 px-6 shadow-md disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-lg"
        >
          <img src={google} alt="Google Logo" className="w-6 h-6" />
          {loading ? "Cargando..." : "Iniciar sesión con Google"}
        </button>
      </div>
    </div>
  );
}
