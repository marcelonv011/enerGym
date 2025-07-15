import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginGoogle from "./app/LoginGoogle";
import PantallaPrincipal from "./app/PantallaPrincipal";
import ProtectedRoute from "./app/ProtectedRoute";
import CrearRutina from "./app/CrearRutina";
import DetalleRutina from "./app/DetalleRutina";
import EditarRutina from "./app/EditarRutina";

import { RutinaActivaProvider } from "./app/RutinaActivaContext"; // IMPORTAR PROVIDER

export default function App() {
  return (
    <RutinaActivaProvider>  {/* ENVOLVÉ TODO CON EL PROVIDER */}
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
    </RutinaActivaProvider>
  );
}
