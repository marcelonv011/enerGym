import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginGoogle from "./app/LoginGoogle";
import PantallaPrincipal from "./app/PantallaPrincipal";
import ProtectedRoute from "./app/ProtectedRoute";
import CrearRutina from "./app/CrearRutina"; // este lo haremos después
import DetalleRutina from "./app/DetalleRutina"; // este también después
import EditarRutina from "./app/EditarRutina";

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
        <Route
          path="/crear-rutina"
          element={
            <ProtectedRoute>
              <CrearRutina />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rutina/:rutinaId"
          element={
            <ProtectedRoute>
              <DetalleRutina />
            </ProtectedRoute>
          }
        />
        <Route 
         path="/editar-rutina/:id" 
         element={
            <ProtectedRoute>
              <EditarRutina />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
