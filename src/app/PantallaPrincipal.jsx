import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function Home() {
  const logout = () => {
    signOut(auth);
  };

  return (
    <div className="text-center mt-20">
      <h1 className="text-2xl font-bold mb-4">🏋️ Bienvenido a tu Gym App</h1>
      <button
        onClick={logout}
        className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
