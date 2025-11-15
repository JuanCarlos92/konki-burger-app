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

/** Tipo de utilidad para añadir un campo 'id' a un tipo genérico T. */
type WithId<T> = T & { id: string };

/**
 * Interfaz para el valor de retorno del hook `useDoc`.
 * @template T - El tipo de los datos del documento.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Datos del documento con su ID, o `null` si no existe o está cargando.
  isLoading: boolean;       // `true` si la carga inicial está en progreso.
  error: FirestoreError | Error | null; // Objeto de error si la suscripción falla.
}

/**
 * Hook de React para suscribirse a un único documento de Firestore en tiempo real.
 * Escucha los cambios en el documento y actualiza el estado del componente automáticamente.
 *
 * ¡IMPORTANTE! Es crucial que el `memoizedDocRef` de entrada sea memoizado usando `useMemoFirebase`.
 * Si no se memoiza, se creará una nueva instancia de la referencia en cada render, lo que provocará
 * re-suscripciones infinitas y un rendimiento deficiente.
 *
 * @template T - Tipo opcional para los datos del documento. Por defecto es `any`.
 * @param {DocumentReference | null | undefined} memoizedDocRef -
 * La `DocumentReference` de Firestore a la que suscribirse. Si es `null` o `undefined`, el hook esperará.
 * @returns {UseDocResult<T>} Un objeto que contiene `data`, `isLoading` y `error`.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // Si la referencia al documento es nula, resetea el estado y no hace nada.
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Crea el listener de Firestore para el documento usando `onSnapshot`.
    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        // Callback de éxito: se ejecuta cada vez que los datos del documento cambian.
        if (snapshot.exists()) {
          // Si el documento existe, actualiza el estado con sus datos, añadiendo el ID.
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // Si el documento no existe (o ha sido eliminado), el estado de `data` es null.
          setData(null);
        }
        setError(null); // Limpia cualquier error anterior.
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // Callback de error: se ejecuta si el listener falla (p.ej., por falta de permisos).
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Emite el error globalmente para que `FirebaseErrorListener` lo capture y lo muestre en desarrollo.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Función de limpieza: se desuscribe del listener cuando el componente se desmonta o la referencia cambia.
    return () => unsubscribe();
  }, [memoizedDocRef]); // Vuelve a ejecutar el efecto si la referencia al documento memoizada cambia.

  return { data, isLoading, error };
}
