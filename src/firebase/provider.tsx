'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'

/** Props para el FirebaseProvider. */
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

/** Define la forma del valor del contexto de Firebase. */
export interface FirebaseContextState {
  areServicesAvailable: boolean; // `true` si los servicios principales (app, firestore, auth) están disponibles.
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // La instancia del servicio de Auth.
  // Estado de autenticación del usuario
  user: User | null;
  isUserLoading: boolean; // `true` durante la comprobación inicial del estado de autenticación.
  userError: Error | null; // Almacena cualquier error del listener de autenticación.
}

/** Valor de retorno para el hook `useFirebase()`. */
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

/** Valor de retorno para el hook `useUser()`. */
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Creación del Contexto de React para Firebase.
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * `FirebaseProvider` es un componente proveedor que gestiona y provee acceso a los servicios de Firebase
 * (App, Firestore, Auth) y al estado de autenticación del usuario a través de toda la aplicación.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Comienza en estado de carga hasta que se determine el estado de autenticación.
    userError: null,
  });

  // Efecto para suscribirse a los cambios de estado de autenticación de Firebase.
  useEffect(() => {
    if (!auth) {
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("El servicio de Auth no fue proporcionado.") });
      return;
    }

    // `onAuthStateChanged` es el listener principal de Firebase Auth. Se dispara cuando un usuario
    // inicia sesión, cierra sesión, o cuando la página se carga y se verifica el estado de la sesión.
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        // Se ha determinado el estado de autenticación.
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => {
        // Ocurrió un error en el listener de autenticación.
        console.error("FirebaseProvider: error en onAuthStateChanged:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );
    // Función de limpieza: desuscribirse del listener al desmontar el componente para evitar fugas de memoria.
    return () => unsubscribe();
  }, [auth]); // Depende de la instancia de `auth`.

  // Memoiza el valor del contexto para evitar re-renderizados innecesarios en los componentes consumidores.
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
      {/* Componente para escuchar y propagar errores de permisos de Firestore, mostrando un overlay en desarrollo. */}
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook para acceder a los servicios principales de Firebase y al estado de autenticación del usuario.
 * Lanza un error si se usa fuera del `FirebaseProvider` o si los servicios no están disponibles.
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

/** Hook de conveniencia para acceder directamente a la instancia de Firebase Auth. */
export const useAuth = (): Auth => useFirebase().auth;

/** Hook de conveniencia para acceder directamente a la instancia de Firestore. */
export const useFirestore = (): Firestore => useFirebase().firestore;

/** Hook de conveniencia para acceder directamente a la instancia de Firebase App. */
export const useFirebaseApp = (): FirebaseApp => useFirebase().firebaseApp;

/**
 * Un hook `useMemo` personalizado que añade una bandera `__memo` a su valor de retorno.
 * Esta bandera es utilizada por los hooks `useDoc` y `useCollection` para verificar en desarrollo
 * que las consultas de Firestore están siendo correctamente memoizadas, ayudando a prevenir
 * bucles de re-renderizado infinitos.
 */
type MemoFirebase <T> = T & {__memo?: boolean};
export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  return memoized;
}

/**
 * Hook específico para acceder únicamente al estado del usuario autenticado.
 * Proporciona el objeto `User`, el estado de carga y cualquier error de autenticación.
 */
export const useUser = (): UserHookResult => {
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
