import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function EditarRutina() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [dias, setDias] = useState({
    lunes: [],
    martes: [],
    miércoles: [],
    jueves: [],
    viernes: [],
    sábado: [],
    domingo: [],
  });

  const [nuevoEjercicio, setNuevoEjercicio] = useState("");
  const [videoURL, setVideoURL] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState("lunes");
  const [mensaje, setMensaje] = useState("");

  const [editando, setEditando] = useState({ dia: null, index: null });
  const [editNombre, setEditNombre] = useState("");
  const [editVideo, setEditVideo] = useState("");

  const [videoModal, setVideoModal] = useState({ abierto: false, url: "" });

  const ordenDias = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

  useEffect(() => {
    const cargarRutina = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      try {
        const ref = doc(db, "users", uid, "rutinas", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setNombre(data.nombre);
          setDias(data.dias);
        } else {
          setMensaje("❌ Rutina no encontrada.");
        }
      } catch (err) {
        console.error("Error al cargar rutina:", err);
        setMensaje("❌ Error al cargar rutina.");
      }
    };

    cargarRutina();
  }, [id]);

  const agregarEjercicio = () => {
    if (!nuevoEjercicio.trim()) return;

    setDias((prev) => ({
      ...prev,
      [diaSeleccionado]: [
        ...prev[diaSeleccionado],
        {
          nombre: nuevoEjercicio,
          videoURL: videoURL.trim() || null,
        },
      ],
    }));

    setNuevoEjercicio("");
    setVideoURL("");
  };

  const eliminarEjercicio = (dia, index) => {
    setDias((prev) => ({
      ...prev,
      [dia]: prev[dia].filter((_, i) => i !== index),
    }));
  };

  const iniciarEdicion = (dia, index, ejercicio) => {
    setEditando({ dia, index });
    setEditNombre(ejercicio.nombre);
    setEditVideo(ejercicio.videoURL || "");
  };

  const guardarEdicion = () => {
    const { dia, index } = editando;
    if (editNombre.trim() === "") return;

    setDias((prev) => {
      const nuevos = [...prev[dia]];
      nuevos[index] = {
        nombre: editNombre,
        videoURL: editVideo.trim() || null,
      };
      return { ...prev, [dia]: nuevos };
    });

    setEditando({ dia: null, index: null });
    setEditNombre("");
    setEditVideo("");
  };

  const cancelarEdicion = () => {
    setEditando({ dia: null, index: null });
    setEditNombre("");
    setEditVideo("");
  };

  const abrirVideo = (url) => {
    const embedUrl = url.includes("youtube.com/watch")
      ? url.replace("watch?v=", "embed/")
      : url;
    setVideoModal({ abierto: true, url: embedUrl });
  };

  const cerrarVideo = () => {
    setVideoModal({ abierto: false, url: "" });
  };

  const guardarCambios = async () => {
    if (!nombre.trim()) {
      setMensaje("❌ Debes poner un nombre a la rutina.");
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      setMensaje("❌ Usuario no autenticado.");
      return;
    }

    try {
      await setDoc(doc(db, "users", uid, "rutinas", id), {
        nombre,
        dias,
        actualizada: new Date(),
      });

      navigate("/");
    } catch (error) {
      console.error(error);
      setMensaje("❌ Error al guardar cambios.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="bg-gray-850 p-8 rounded-3xl shadow-2xl max-w-xl mx-auto">
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-6 text-emerald-400 hover:text-emerald-600 transition font-semibold"
            aria-label="Volver atrás"
        >
        ← Volver
        </button>
        <h1 className="text-3xl font-extrabold mb-6 text-emerald-400 tracking-wide drop-shadow-lg">
          ✏️ Editar Rutina
        </h1>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la rutina"
          className="w-full p-4 rounded-lg bg-gray-700 border border-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-white mb-6 transition"
        />

        <div className="flex flex-col gap-4 mb-6">
          <select
            value={diaSeleccionado}
            onChange={(e) => setDiaSeleccionado(e.target.value)}
            className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 text-white transition"
          >
            {ordenDias.map((d) => (
              <option key={d} value={d} className="capitalize">
                {d}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={nuevoEjercicio}
            onChange={(e) => setNuevoEjercicio(e.target.value)}
            placeholder="Ejercicio (Ej: Sentadillas)"
            className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-white transition"
          />

          <input
            type="text"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            placeholder="Link YouTube (opcional)"
            className="p-3 rounded-lg bg-gray-700 border border-gray-600 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 text-white transition"
          />
        </div>

        <button
          onClick={agregarEjercicio}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition text-white py-3 rounded-xl font-semibold w-full shadow-md shadow-emerald-600/50 mb-8"
        >
          ➕ Agregar ejercicio
        </button>

        {ordenDias.map((dia) => (
          <div key={dia} className="mb-8">
            <h3 className="text-2xl font-bold text-emerald-300 capitalize mb-4 tracking-wide">
              {dia}
            </h3>

            {dias[dia].length === 0 ? (
              <p className="text-gray-400 italic">Sin ejercicios.</p>
            ) : (
              <ul className="space-y-3">
                {dias[dia].map((e, i) => (
                  <li
                    key={i}
                    className="bg-gray-700 rounded-2xl p-5 flex flex-col shadow-lg shadow-black/50"
                  >
                    {editando.dia === dia && editando.index === i ? (
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={editNombre}
                          onChange={(ev) => setEditNombre(ev.target.value)}
                          className="p-3 rounded-lg bg-gray-600 border border-gray-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 placeholder-gray-300 text-white transition"
                          placeholder="Nombre del ejercicio"
                        />
                        <input
                          type="text"
                          value={editVideo}
                          onChange={(ev) => setEditVideo(ev.target.value)}
                          className="p-3 rounded-lg bg-gray-600 border border-gray-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500 placeholder-gray-300 text-white transition"
                          placeholder="Link YouTube (opcional)"
                        />
                        <div className="flex gap-4 mt-2 justify-end">
                          <button
                            onClick={guardarEdicion}
                            className="bg-emerald-500 hover:bg-emerald-600 transition px-5 py-2 rounded-full font-semibold shadow-md shadow-emerald-600/60"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="bg-gray-500 hover:bg-gray-600 transition px-5 py-2 rounded-full font-semibold"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <span className="font-semibold text-lg">{e.nombre}</span>
                        {e.videoURL && (
                          <button
                            onClick={() => abrirVideo(e.videoURL)}
                            className="text-emerald-400 hover:text-emerald-300 underline text-sm self-start transition"
                            aria-label={`Ver video de ${e.nombre}`}
                          >
                            📹 Ver video
                          </button>
                        )}
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => iniciarEdicion(dia, i, e)}
                            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-1 rounded-full text-sm font-semibold shadow-sm shadow-blue-700/50"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => eliminarEjercicio(dia, i)}
                            className="bg-red-600 hover:bg-red-700 transition px-4 py-1 rounded-full text-sm font-semibold shadow-sm shadow-red-700/50"
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}

        {mensaje && (
          <p className="text-red-500 mt-4 font-medium text-center">{mensaje}</p>
        )}

        <button
          onClick={guardarCambios}
          className="mt-10 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition py-4 rounded-3xl font-extrabold text-white shadow-lg shadow-blue-700/70"
        >
          💾 Guardar cambios
        </button>
      </div>

      {/* Modal de video */}
      {videoModal.abierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={cerrarVideo}
        >
          <div
            className="bg-gray-900 rounded-3xl max-w-3xl w-full aspect-video shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarVideo}
              className="absolute top-4 right-5 text-white text-3xl font-bold hover:text-emerald-400 transition"
              aria-label="Cerrar modal de video"
            >
              ×
            </button>
            <iframe
              src={videoModal.url}
              title="Video ejercicio"
              className="w-full h-full rounded-3xl"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
