import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function LoginGoogle() {
  const navigate = useNavigate();

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/"); // redirige a Home
    } catch (error) {
      alert("Error al iniciar sesión con Google: " + error.message);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-20 bg-white rounded shadow text-center">
      <h2 className="text-xl font-bold mb-6">Iniciar sesión con Google</h2>
      <button
        onClick={loginWithGoogle}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
      >
        Entrar con Google
      </button>
    </div>
  );
}
