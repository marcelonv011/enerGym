import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { PlayCircle, Edit2, Trash2 } from "lucide-react";

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

  // Estado para control modal eliminación
  const [modalEliminar, setModalEliminar] = useState({
    abierto: false,
    dia: null,
    index: null,
  });

  const ordenDias = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
  ];

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

  // Función que abre modal para confirmar eliminación
  const solicitarEliminarEjercicio = (dia, index) => {
    setModalEliminar({ abierto: true, dia, index });
  };

  // Confirmar eliminación
  const confirmarEliminarEjercicio = () => {
    const { dia, index } = modalEliminar;
    if (dia === null || index === null) return;

    setDias((prev) => ({
      ...prev,
      [dia]: prev[dia].filter((_, i) => i !== index),
    }));

    setModalEliminar({ abierto: false, dia: null, index: null });
  };

  // Cancelar eliminación
  const cancelarEliminar = () => {
    setModalEliminar({ abierto: false, dia: null, index: null });
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-5xl bg-gray-900 bg-opacity-80 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-700">

        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-500 transition font-semibold self-start"
          >
            ← Volver
          </button>

          <h1 className="text-4xl font-extrabold text-emerald-400 tracking-tight text-center">
            ✏️ Editar rutina
          </h1>
        </div>

        {/* Input nombre rutina */}
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la rutina"
          className="w-full p-4 rounded-xl bg-gray-800 text-white mb-6 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* Form agregar ejercicio */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <select
            value={diaSeleccionado}
            onChange={(e) => setDiaSeleccionado(e.target.value)}
            className="p-4 rounded-xl bg-gray-800 text-white w-full sm:w-1/4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {ordenDias.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={nuevoEjercicio}
            onChange={(e) => setNuevoEjercicio(e.target.value)}
            placeholder="Ejercicio (Ej: Sentadillas 4x12)"
            className="p-4 rounded-xl bg-gray-800 text-white w-full sm:w-2/4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <input
            type="text"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            placeholder="Link YouTube (opcional)"
            className="p-4 rounded-xl bg-gray-800 text-white w-full sm:w-1/4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          onClick={agregarEjercicio}
          className="w-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 transition-all py-3 rounded-full text-lg font-semibold shadow-lg hover:shadow-emerald-700/50 active:scale-95 mb-10"
        >
          ➕ Agregar ejercicio al día
        </button>

        {/* Lista de ejercicios por día */}
        <div className="space-y-6">
          {ordenDias.map((dia) => (
            <div key={dia}>
              <h3 className="text-xl font-bold text-emerald-300 capitalize mb-2">{dia}</h3>
              {dias[dia].length === 0 ? (
                <p className="text-gray-500 text-sm ml-2">Sin ejercicios.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dias[dia].map((e, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-md flex flex-col gap-3"
                    >
                      {editando.dia === dia && editando.index === i ? (
                        <>
                          <input
                            type="text"
                            value={editNombre}
                            onChange={(ev) => setEditNombre(ev.target.value)}
                            placeholder="Nombre del ejercicio"
                            className="p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <input
                            type="text"
                            value={editVideo}
                            onChange={(ev) => setEditVideo(ev.target.value)}
                            placeholder="URL del video (YouTube u otro)"
                            className="p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={guardarEdicion}
                              className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-full font-semibold text-white transition"
                            >
                              💾
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold">{e.nombre}</p>
                          <div className="flex justify-end gap-2 mt-2">
                            {e.videoURL && (
                              <button
                                onClick={() => abrirVideo(e.videoURL)}
                                className="p-2 rounded-full bg-gray-700 hover:bg-blue-500 transition"
                              >
                                <PlayCircle size={20} className="text-blue-400" />
                              </button>
                            )}
                            <button
                              onClick={() => iniciarEdicion(dia, i, e)}
                              className="p-2 rounded-full bg-gray-700 hover:bg-yellow-500 transition"
                            >
                              <Edit2 size={20} className="text-yellow-400" />
                            </button>
                            <button
                              onClick={() => solicitarEliminarEjercicio(dia, i)}
                              className="p-2 rounded-full bg-gray-700 hover:bg-red-500 transition"
                            >
                              <Trash2 size={20} className="text-red-400" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {mensaje && (
          <p className="text-sm text-red-400 mt-8 text-center">{mensaje}</p>
        )}

        <button
          onClick={guardarCambios}
          className="w-full bg-blue-500 hover:bg-blue-600 transition-all text-white mt-10 py-4 rounded-full text-lg font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-700/50 active:scale-95"
        >
          💾 Guardar cambios
        </button>
      </div>

      {/* Modal video */}
      {videoModal.abierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={cerrarVideo}
        >
          <div
            className="bg-gray-900 rounded-3xl max-w-3xl w-full aspect-video shadow-2xl relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cerrarVideo}
              className="absolute top-4 right-5 text-white text-3xl font-bold hover:text-emerald-400 transition"
            >
              ×
            </button>
            <iframe
              src={videoModal.url}
              title="Video ejercicio"
              className="w-full h-full rounded-3xl"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* Modal confirmación eliminar */}
      {modalEliminar.abierto && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex flex-col justify-center items-center z-50 p-4"
          onClick={cancelarEliminar}
        >
          <div
            className="bg-gray-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-semibold text-red-400 mb-6">
              ¿Eliminar este ejercicio?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={confirmarEliminarEjercicio}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full text-lg font-bold shadow-md active:scale-95"
              >
                Sí, eliminar
              </button>
              <button
                onClick={cancelarEliminar}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-full text-lg font-bold shadow-md active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
