'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Firebase específico para el lado del cliente (`'use client'`).
 * 
 * Este componente tiene una única y crucial responsabilidad: inicializar Firebase UNA SOLA VEZ
 * en el navegador del cliente y pasar los servicios inicializados (app, auth, firestore)
 * al `FirebaseProvider` principal.
 * 
 * Usar `useMemo` con un array de dependencias vacío `[]` es la clave para asegurar que
 * la función `initializeFirebase` se llame solo durante el montaje inicial del componente.
 * Esto evita reinicializaciones innecesarias que podrían causar errores o pérdida de estado.
 * 
 * @param {FirebaseClientProviderProps} props - Propiedades del componente.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // `useMemo` con un array de dependencias vacío `[]` asegura que `initializeFirebase`
  // se llame solo una vez, cuando el componente se monta por primera vez en el cliente.
  const firebaseServices = useMemo(() => {
    // Inicializa Firebase en el lado del cliente.
    return initializeFirebase();
  }, []); // El array vacío es crucial para la inicialización única.

  return (
    // Envuelve a los hijos con el proveedor principal (`FirebaseProvider`), 
    // pasándole los SDKs de Firebase ya inicializados como props.
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
