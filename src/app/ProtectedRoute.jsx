import { Navigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

// npm install react-firebase-hooks si no lo tenés
// npm install react-firebase-hooks

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div className="text-center mt-20">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
