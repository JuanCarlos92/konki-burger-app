'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * IMPORTANTE: NO MODIFICAR ESTA FUNCIÓN
 * 
 * Inicializa la aplicación de Firebase.
 * Esta función está diseñada para funcionar tanto en un entorno de Firebase App Hosting
 * (donde la configuración se inyecta automáticamente) como en un entorno de desarrollo local
 * (donde se usa el objeto `firebaseConfig`).
 */
export function initializeFirebase() {
  // Si ya hay una aplicación inicializada, la reutiliza.
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp;
  try {
    // Firebase App Hosting se integra con initializeApp() para proveer variables de entorno.
    // Primero intentamos inicializar sin un objeto de configuración.
    firebaseApp = initializeApp();
  } catch (e) {
    // Si la inicialización automática falla (ej. en desarrollo local),
    // recurrimos a usar el objeto de configuración explícito.
    if (process.env.NODE_ENV === "production") {
      console.warn('La inicialización automática de Firebase falló. Usando firebaseConfig como respaldo.', e);
    }
    firebaseApp = initializeApp(firebaseConfig);
  }

  // Devuelve los SDKs de los servicios de Firebase inicializados.
  return getSdks(firebaseApp);
}

/**
 * Obtiene los SDKs de los servicios de Firebase a partir de la aplicación inicializada.
 * @param {FirebaseApp} firebaseApp - La instancia de la aplicación de Firebase.
 * @returns Un objeto con los servicios de `auth` y `firestore`.
 */
export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

// Re-exporta todos los módulos para un acceso centralizado.
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
