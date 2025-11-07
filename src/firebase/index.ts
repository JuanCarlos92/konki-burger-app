'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp;
  try {
    // Firebase App Hosting integrates with initializeApp() to provide environment variables.
    // We first attempt to initialize without a config object.
    firebaseApp = initializeApp();
  } catch (e) {
    // If automatic initialization fails (e.g., not in a fully configured App Hosting env),
    // we fall back to using the explicit config object. This is common for local development.
    if (process.env.NODE_ENV === "production") {
      console.warn('Firebase automatic initialization failed. Falling back to firebaseConfig.', e);
    }
    firebaseApp = initializeApp(firebaseConfig);
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
