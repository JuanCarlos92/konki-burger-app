'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Proveedor de Firebase para el lado del cliente.
 * Este componente es responsable de inicializar Firebase UNA SOLA VEZ en el cliente
 * y de pasar los servicios inicializados (app, auth, firestore) al `FirebaseProvider` principal.
 * @param {FirebaseClientProviderProps} props - Propiedades del componente.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // `useMemo` con un array de dependencias vacío asegura que `initializeFirebase`
  // se llame solo una vez, cuando el componente se monta por primera vez en el cliente.
  const firebaseServices = useMemo(() => {
    // Inicializa Firebase en el lado del cliente.
    return initializeFirebase();
  }, []); // El array vacío es crucial.

  return (
    // Envuelve a los hijos con el proveedor principal, pasándole los SDKs de Firebase.
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
