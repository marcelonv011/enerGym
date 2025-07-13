import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import google from "../assets/google.png";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/gym-bg.png"; // tu imagen de fondo

export default function LoginGoogle() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Error al iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-6 bg-cover bg-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="bg-black bg-opacity-70 rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-5xl font-extrabold mb-6 text-emerald-400 tracking-wide">
          Energym
        </h1>
        <p className="text-gray-300 mb-10 text-base font-medium leading-relaxed">
          ¡Bienvenido/a!<br />
          Inicia sesión para comenzar tu progreso en el gym.
        </p>

        {error && (
          <div className="mb-6 text-red-500 font-semibold text-sm">{error}</div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex items-center justify-center gap-3 w-48 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200 ease-in-out text-white rounded-xl py-3 px-4 shadow-lg disabled:opacity-60 disabled:cursor-not-allowed font-semibold text-sm sm:text-base"
          >
            <img src={google} alt="Google Logo" className="w-5 h-5" />
            {loading ? "Cargando..." : "Ingresar"}
          </button>
        </div>
      </div>
    </div>
  );
}
