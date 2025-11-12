'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Tipo de utilidad para añadir un campo 'id' a un tipo T. */
type WithId<T> = T & { id: string };

/**
 * Interfaz para el valor de retorno del hook useDoc.
 * @template T Tipo de los datos del documento.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Datos del documento con ID, o null si no existe o está cargando.
  isLoading: boolean;       // True si está cargando.
  error: FirestoreError | Error | null; // Objeto de error, o null.
}

/**
 * Hook de React para suscribirse a un único documento de Firestore en tiempo real.
 * Maneja referencias nulas.
 *
 * ¡IMPORTANTE! DEBES MEMOIZAR el `memoizedDocRef` de entrada usando `useMemoFirebase`,
 * o ocurrirán comportamientos inesperados (re-suscripciones infinitas).
 *
 * @template T Tipo opcional para los datos del documento. Por defecto es `any`.
 * @param {DocumentReference | null | undefined} memoizedDocRef -
 * La DocumentReference de Firestore. Espera si es null/undefined.
 * @returns {UseDocResult<T>} Un objeto con `data`, `isLoading`, y `error`.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // Si la referencia al documento es nula, resetea el estado.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Crea el listener de Firestore para el documento.
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        // En caso de éxito.
        if (snapshot.exists()) {
          // Si el documento existe, actualiza el estado con sus datos.
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // Si el documento no existe, el estado de `data` es null.
          setData(null);
        }
        setError(null); // Limpia cualquier error anterior.
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // En caso de error (ej. permisos).
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // Emite el error globalmente para que `FirebaseErrorListener` lo capture.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Función de limpieza: se desuscribe del listener cuando el componente se desmonta.
    return () => unsubscribe();
  }, [memoizedDocRef]); // Vuelve a ejecutar el efecto si la referencia al documento cambia.

  return { data, isLoading, error };
}
