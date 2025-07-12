import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginGoogle from "./app/LoginGoogle";
import PantallaPrincipal from "./app/PantallaPrincipal";
import ProtectedRoute from "./app/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginGoogle />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <PantallaPrincipal />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
