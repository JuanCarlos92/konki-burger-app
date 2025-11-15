'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Tipo de utilidad para añadir un campo 'id' a un tipo genérico T. */
export type WithId<T> = T & { id: string };

/**
 * Interfaz para el valor de retorno del hook `useCollection`.
 * @template T - El tipo de los datos del documento.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Un array de documentos con su ID, o `null` si aún no se han cargado.
  isLoading: boolean;       // `true` si la carga inicial está en progreso.
  error: FirestoreError | Error | null; // Un objeto de error si la suscripción falla.
}

/**
 * Interfaz interna para acceder a propiedades no públicas de una Query de Firestore.
 * Se utiliza para obtener la ruta canónica de la consulta para los mensajes de error.
 */
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * Hook de React para suscribirse a una colección o consulta de Firestore en tiempo real.
 * Escucha los cambios y actualiza el estado del componente automáticamente.
 *
 * ¡IMPORTANTE! Es crucial que el `memoizedTargetRefOrQuery` de entrada sea memoizado usando `useMemoFirebase`.
 * Si no se memoiza, se creará una nueva instancia de la consulta en cada render, lo que provocará
 * re-suscripciones infinitas y un rendimiento deficiente.
 *  
 * @template T - Tipo opcional para los datos de los documentos en la colección. Por defecto es `any`.
 * @param {CollectionReference | Query | null | undefined} memoizedTargetRefOrQuery -
 * La `CollectionReference` o `Query` de Firestore a la que suscribirse. Si es `null` o `undefined`, el hook esperará.
 * @returns {UseCollectionResult<T>} Un objeto que contiene `data`, `isLoading` y `error`.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>) & {__memo?: boolean})  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // Si la referencia a la consulta es nula, resetea el estado y no hace nada.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Crea el listener de Firestore usando `onSnapshot`.
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // Callback de éxito: se ejecuta cada vez que los datos cambian.
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          // Mapea los documentos del snapshot, añadiendo el ID a cada objeto de datos.
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // Callback de error: se ejecuta si el listener falla (p.ej., por falta de permisos).
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        // Emite el error globalmente para que `FirebaseErrorListener` lo capture y lo muestre en desarrollo.
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Función de limpieza: se desuscribe del listener cuando el componente se desmonta o la consulta cambia.
    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]); // Vuelve a ejecutar el efecto si la consulta/referencia memoizada cambia.

  // Comprobación en desarrollo para asegurar que la consulta está siendo memoizada.
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' no fue correctamente memoizado usando useMemoFirebase');
  }
  
  return { data, isLoading, error };
}
