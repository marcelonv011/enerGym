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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-emerald-400">✏️ Editar rutina</h1>

        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la rutina"
          className="w-full p-3 rounded bg-gray-700 text-white mb-4"
        />

        <div className="flex flex-col gap-3 mb-4">
          <select
            value={diaSeleccionado}
            onChange={(e) => setDiaSeleccionado(e.target.value)}
            className="p-3 rounded bg-gray-700 text-white"
          >
            {Object.keys(dias).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={nuevoEjercicio}
            onChange={(e) => setNuevoEjercicio(e.target.value)}
            placeholder="Ejercicio (Ej: Sentadillas)"
            className="p-3 rounded bg-gray-700 text-white"
          />

          <input
            type="text"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            placeholder="Link YouTube (opcional)"
            className="p-3 rounded bg-gray-700 text-white"
          />
        </div>

        <button
          onClick={agregarEjercicio}
          className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded font-semibold mb-6 w-full"
        >
          ➕ Agregar ejercicio
        </button>

        {Object.entries(dias).map(([dia, ejercicios]) => (
          <div key={dia} className="mb-4">
            <h3 className="text-xl font-bold text-emerald-300 capitalize mb-2">{dia}</h3>

            {ejercicios.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin ejercicios.</p>
            ) : (
              <ul className="space-y-2">
                {ejercicios.map((e, i) => (
                  <li key={i} className="bg-gray-700 p-3 rounded flex flex-col">
                    {editando.dia === dia && editando.index === i ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={editNombre}
                          onChange={(ev) => setEditNombre(ev.target.value)}
                          className="p-2 rounded bg-gray-600 text-white"
                          placeholder="Nombre del ejercicio"
                        />
                        <input
                          type="text"
                          value={editVideo}
                          onChange={(ev) => setEditVideo(ev.target.value)}
                          className="p-2 rounded bg-gray-600 text-white"
                          placeholder="Link YouTube (opcional)"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={guardarEdicion}
                            className="bg-emerald-500 px-3 py-1 rounded text-sm"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cancelarEdicion}
                            className="bg-gray-500 px-3 py-1 rounded text-sm"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        <span>{e.nombre}</span>
                        {e.videoURL && (
                          <a
                            href={e.videoURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 text-xs underline mt-1"
                          >
                            Ver video 📹
                          </a>
                        )}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => iniciarEdicion(dia, i, e)}
                            className="bg-blue-500 px-3 py-1 rounded text-xs"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarEjercicio(dia, i)}
                            className="bg-red-500 px-3 py-1 rounded text-xs"
                          >
                            Eliminar
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

        {mensaje && <p className="text-sm text-red-400 mt-4">{mensaje}</p>}

        <button
          onClick={guardarCambios}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white mt-6 py-3 rounded font-semibold"
        >
          💾 Guardar cambios
        </button>
      </div>
    </div>
  );
}
