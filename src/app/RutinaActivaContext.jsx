import React, { createContext, useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const RutinaActivaContext = createContext();

export function RutinaActivaProvider({ children }) {
  const [rutinaActivaId, setRutinaActivaId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRutinaActiva = async (uid) => {
    if (!uid) {
      setRutinaActivaId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const ref = collection(db, "users", uid, "rutinas");
      const snapshot = await getDocs(ref);
      const activa = snapshot.docs.find(doc => doc.data().activa);
      setRutinaActivaId(activa?.id || null);
    } catch (error) {
      console.error("Error al obtener rutina activa:", error);
      setRutinaActivaId(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchRutinaActiva(user.uid);
      } else {
        setRutinaActivaId(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <RutinaActivaContext.Provider value={{ rutinaActivaId, setRutinaActivaId, fetchRutinaActiva, loading }}>
      {children}
    </RutinaActivaContext.Provider>
  );
}
