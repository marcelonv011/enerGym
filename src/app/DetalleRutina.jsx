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
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

function extraerVideoId(url) {
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^\s&?/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export default function DetalleRutina() {
  const { rutinaId } = useParams();
  const [rutina, setRutina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoVisible, setVideoVisible] = useState(null);
  const [mostrarModalProgreso, setMostrarModalProgreso] = useState(false);
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  const [observacion, setObservacion] = useState("");
  const [progresos, setProgresos] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRutina = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const ref = doc(db, "users", uid, "rutinas", rutinaId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) setRutina(snapshot.data());
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
      const ref = collection(db, "users", uid, "rutinas", rutinaId, "progreso");
      const q = fecha
        ? query(ref, where("fecha", "==", fecha))
        : query(ref, orderBy("creada", "desc"));

      const snap = await getDocs(q);
      setProgresos(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const registrarProgreso = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !observacion.trim()) return;

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
      fetchProgresos(uid, fechaFiltro);
    } catch (err) {
      console.error("Error al guardar progreso:", err);
    }
  };

  const eliminarProgreso = async (id) => {
    const uid = auth.currentUser?.uid;
    if (!uid || !window.confirm("¿Seguro que quieres eliminar este progreso?")) return;

    try {
      await deleteDoc(doc(db, "users", uid, "rutinas", rutinaId, "progreso", id));
      fetchProgresos(uid, fechaFiltro);
    } catch (err) {
      console.error("Error al eliminar progreso:", err);
    }
  };

  const guardarEdicion = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid || !observacion.trim()) return;

    try {
      const ref = doc(db, "users", uid, "rutinas", rutinaId, "progreso", editandoId);
      await updateDoc(ref, { observacion });
      setEditandoId(null);
      setObservacion("");
      fetchProgresos(uid, fechaFiltro);
    } catch (err) {
      console.error("Error al editar progreso:", err);
    }
  };

  const ordenDias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

  if (loading) return <div className="text-white text-center mt-20">Cargando...</div>;
  if (!rutina) return <div className="text-white text-center mt-20">Rutina no encontrada</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-700">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-500 transition font-semibold mb-4"
        >
          ← Volver
        </button>

        <h1 className="text-center text-3xl sm:text-4xl font-extrabold text-emerald-400 mb-10">
          🏋️ {rutina.nombre}
        </h1>

        {ordenDias.map((dia) => {
          const ejercicios = rutina.dias[dia];
          if (!ejercicios?.length) return null;

          return (
            <div key={dia} className="mb-10">
              <h2 className="text-xl font-bold capitalize text-emerald-300 mb-3">{dia}</h2>
              <div className="space-y-4">
                {ejercicios.map((e, i) => {
                  const videoId = e.videoURL ? extraerVideoId(e.videoURL) : null;
                  const mostrarVideo = videoVisible === `${dia}-${i}`;

                  return (
                    <div
                      key={i}
                      className="bg-gray-800 rounded-xl shadow-md p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex-1">
                        <p className="text-lg font-bold">{e.nombre}</p>

                        {e.videoURL && (
                          <>
                            <button
                              onClick={() =>
                                setVideoVisible(mostrarVideo ? null : `${dia}-${i}`)
                              }
                              className="mt-2 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                            >
                              {mostrarVideo ? "Ocultar video" : "Mostrar video"}
                            </button>

                            {mostrarVideo && (
                              <div className="mt-2">
                                {videoId ? (
                                  <iframe
                                    width="300"
                                    height="170"
                                    src={`https://www.youtube.com/embed/${videoId}`}
                                    title="Video ejercicio"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg shadow-lg"
                                  ></iframe>
                                ) : (
                                  <iframe
                                    width="300"
                                    height="170"
                                    src={e.videoURL}
                                    title="Video externo"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="rounded-lg shadow-lg"
                                  ></iframe>
                                )}
                              </div>
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
                        className="bg-emerald-500 hover:bg-emerald-600 text-sm px-4 py-2 rounded font-semibold"
                      >
                        Registrar progreso 📈
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Historial */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-emerald-400 mb-4">📊 Historial de progreso</h2>

          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => {
              const newFecha = e.target.value;
              setFechaFiltro(newFecha);
              const uid = auth.currentUser?.uid;
              if (uid) fetchProgresos(uid, newFecha);
            }}
            className="p-3 mb-6 rounded-xl bg-gray-800 text-white border border-gray-600"
          />

          {progresos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay avances registrados para esta fecha.</p>
          ) : (
            <ul className="space-y-3">
              {progresos.map((p) => (
                <li key={p.id} className="bg-gray-800 p-4 rounded-xl shadow text-gray-200 space-y-2">
                  <p><b>Ejercicio:</b> {p.ejercicio}</p>
                  {editandoId === p.id ? (
                    <>
                      <textarea
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        rows={2}
                        className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={guardarEdicion}
                          className="bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditandoId(null);
                            setObservacion("");
                          }}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p><b>Observación:</b> {p.observacion}</p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            setEditandoId(p.id);
                            setObservacion(p.observacion);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarProgreso(p.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                        >
                          Borrar
                        </button>
                      </div>
                    </>
                  )}
                  <small className="text-gray-500 block mt-1">📅 {p.fecha}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Modal registrar progreso */}
      {mostrarModalProgreso && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-emerald-400 mb-4">Registrar progreso</h2>
            <p className="text-gray-300 mb-2"><b>Ejercicio:</b> {ejercicioSeleccionado}</p>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej: 4x12 con 60kg"
              className="w-full p-4 rounded-xl bg-gray-800 text-white mb-4 border border-gray-600"
              rows={4}
            ></textarea>
            <button
              onClick={registrarProgreso}
              className="w-full bg-emerald-500 hover:bg-emerald-600 py-2 rounded-full font-semibold mb-3"
            >
              💾 Guardar progreso
            </button>
            <button
              onClick={() => setMostrarModalProgreso(false)}
              className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-full font-semibold"
            >
              Cancelar ✖️
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
