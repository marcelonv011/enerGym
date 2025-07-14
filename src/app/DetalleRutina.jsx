import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

function extraerVideoId(url) {
  const regex =
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&?/]+)/;
  const match = url.match(regex);
  return match ? match[1] : "";
}

export default function DetalleRutina() {
  const { rutinaId } = useParams();
  const [rutina, setRutina] = useState(null);
  const [loading, setLoading] = useState(true);

  // Para manejar qué video mostrar (por ejercicio)
  const [videoVisible, setVideoVisible] = useState(null);

  const [mostrarModalProgreso, setMostrarModalProgreso] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  const [observacion, setObservacion] = useState("");

  const [progresos, setProgresos] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRutina = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const ref = doc(db, "users", uid, "rutinas", rutinaId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setRutina(snapshot.data());
        }

        await fetchProgresos(uid, "");
      } catch (error) {
        console.error("Error al cargar rutina o progreso:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRutina();
  }, [rutinaId]);

  const fetchProgresos = async (uid, fecha) => {
    try {
      const progresoRef = collection(db, "users", uid, "rutinas", rutinaId, "progreso");

      let q;
      if (fecha) {
        q = query(progresoRef, where("fecha", "==", fecha));
      } else {
        q = query(progresoRef, orderBy("creada", "desc"));
      }

      const progresoSnap = await getDocs(q);
      const progresoData = progresoSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProgresos(progresoData);
    } catch (error) {
      console.error("Error al cargar progresos:", error);
    }
  };

  const onChangeFechaFiltro = (e) => {
    const newFecha = e.target.value;
    setFechaFiltro(newFecha);

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    fetchProgresos(uid, newFecha);
  };

  const registrarProgreso = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!observacion.trim()) {
      alert("Por favor, ingresa una observación.");
      return;
    }

    try {
      const ref = collection(db, "users", uid, "rutinas", rutinaId, "progreso");
      const fechaHoy = new Date().toISOString().split("T")[0];

      await addDoc(ref, {
        fecha: fechaHoy,
        dia: diaSeleccionado,
        ejercicio: ejercicioSeleccionado,
        observacion,
        creada: new Date(),
      });

      setMostrarModalProgreso(false);
      setObservacion("");
      alert("✅ Progreso guardado!");

      fetchProgresos(uid, fechaFiltro);
    } catch (err) {
      console.error("Error al guardar progreso:", err);
      alert("❌ Error al guardar el progreso");
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Cargando...</div>;
  if (!rutina) return <div className="text-white text-center mt-20">Rutina no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-xl shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-400">{rutina.nombre}</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-semibold"
          >
            ← Volver
          </button>
        </div>

        {Object.entries(rutina.dias).map(([dia, ejercicios]) => (
          <div key={dia} className="mb-8">
            <h2 className="text-xl font-semibold capitalize text-emerald-300 mb-2">{dia}</h2>
            <div className="space-y-3">
              {ejercicios.map((e, i) => {
                const videoId = e.videoURL ? extraerVideoId(e.videoURL) : null;
                const mostrarVideo = videoVisible === `${dia}-${i}`;

                return (
                  <div
                    key={i}
                    className="bg-gray-700 p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                  >
                    <div className="flex-1">
                      <p className="text-lg font-bold">{e.nombre}</p>

                      {e.videoURL && (
                        <>
                          <button
                            onClick={() =>
                              setVideoVisible(mostrarVideo ? null : `${dia}-${i}`)
                            }
                            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
                          >
                            {mostrarVideo ? "Ocultar video" : "Mostrar video"}
                          </button>

                          {mostrarVideo && videoId && (
                            <iframe
                              width="300"
                              height="170"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title="Video ejercicio"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="mt-2 rounded-lg shadow-lg"
                            ></iframe>
                          )}

                          {/* Si el link no es youtube (videoId null), ponemos link externo */}
                          {!videoId && (
                            <a
                              href={e.videoURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block mt-2 text-sm text-blue-400 underline"
                            >
                              Ver video externo 📹
                            </a>
                          )}
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setEjercicioSeleccionado(e.nombre);
                        setDiaSeleccionado(dia);
                        setMostrarModalProgreso(true);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-sm px-3 py-1 rounded"
                    >
                      Registrar progreso 📈
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">Historial de progreso</h2>

          <input
            type="date"
            value={fechaFiltro}
            onChange={onChangeFechaFiltro}
            className="p-2 rounded bg-gray-700 text-white mb-4"
          />

          {progresos.length === 0 ? (
            <p className="text-gray-300">No hay avances registrados para esta fecha.</p>
          ) : (
            <ul className="space-y-3 max-h-64 overflow-y-auto">
              {progresos.map((p) => (
                <li key={p.id} className="bg-gray-700 p-4 rounded shadow text-gray-200">
                  <p>
                    <b>Ejercicio:</b> {p.ejercicio} <br />
                    <b>Observación:</b> {p.observacion}
                  </p>
                  <small className="text-gray-400">Fecha: {p.fecha}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {mostrarModalProgreso && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold text-emerald-400 mb-4">Registrar progreso</h2>

            <p className="text-gray-300 mb-2">
              <b>Ejercicio:</b> {ejercicioSeleccionado}
            </p>

            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: 4x12 con 60kg"
              className="w-full p-3 rounded bg-gray-700 text-white mb-4"
              rows={3}
            ></textarea>

            <button
              onClick={registrarProgreso}
              className="w-full bg-emerald-500 hover:bg-emerald-600 py-2 rounded font-semibold mb-2"
            >
              Guardar progreso
            </button>

            <button
              onClick={() => setMostrarModalProgreso(false)}
              className="w-full bg-red-500 hover:bg-red-600 py-2 rounded font-semibold"
            >
              Cancelar ✖️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
