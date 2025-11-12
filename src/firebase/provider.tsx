'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

/** Estado interno para la autenticación del usuario. */
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/** Estado combinado para el contexto de Firebase. */
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True si los servicios principales están disponibles.
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // La instancia del servicio de Auth.
  // Estado de autenticación del usuario
  user: User | null;
  isUserLoading: boolean; // True durante la comprobación inicial de autenticación.
  userError: Error | null; // Error del listener de autenticación.
}

/** Valor de retorno para useFirebase(). */
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/** Valor de retorno para useUser(). */
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Contexto de React
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider gestiona y provee los servicios de Firebase y el estado de autenticación del usuario.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Comienza cargando hasta el primer evento de autenticación.
    userError: null,
  });

  // Efecto para suscribirse a los cambios de estado de autenticación de Firebase.
  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Servicio de Auth no proporcionado.") });
      return;
    }

    // El listener onAuthStateChanged se dispara cuando el usuario inicia/cierra sesión o al cargar la página.
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Estado de autenticación determinado.
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        // Error en el listener de autenticación.
        console.error("FirebaseProvider: error en onAuthStateChanged:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    // Limpieza: desuscribirse del listener al desmontar el componente.
    return () => unsubscribe();
  }, [auth]); // Depende de la instancia de auth.

  // Memoiza el valor del contexto para evitar re-renderizados innecesarios.
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: servicesAvailable ? firebaseApp : null,
      firestore: servicesAvailable ? firestore : null,
      auth: servicesAvailable ? auth : null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      {/* Componente para escuchar y propagar errores de permisos de Firestore. */}
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook para acceder a los servicios principales de Firebase y al estado de autenticación del usuario.
 * Lanza un error si los servicios no están disponibles o si se usa fuera del proveedor.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase debe ser usado dentro de un FirebaseProvider.');
  }
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Los servicios principales de Firebase no están disponibles. Comprueba las props de FirebaseProvider.');
  }
  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook para acceder a la instancia de Firebase Auth. */
export const useAuth = (): Auth => useFirebase().auth;

/** Hook para acceder a la instancia de Firestore. */
export const useFirestore = (): Firestore => useFirebase().firestore;

/** Hook para acceder a la instancia de Firebase App. */
export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;

/**
 * Un hook `useMemo` personalizado que añade una bandera para verificar que se está usando
 * para memoizar consultas de Firestore, evitando re-renderizados infinitos en `useDoc` y `useCollection`.
 */
type MemoFirebase <T> = T & {__memo?: boolean};
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}

/**
 * Hook específico para acceder al estado del usuario autenticado.
 * Proporciona el objeto User, el estado de carga y cualquier error de autenticación.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
