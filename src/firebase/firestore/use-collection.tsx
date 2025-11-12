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

/** Tipo de utilidad para añadir un campo 'id' a un tipo T. */
export type WithId<T> = T & { id: string };

/**
 * Interfaz para el valor de retorno del hook useCollection.
 * @template T Tipo de los datos del documento.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Datos del documento con ID, o null.
  isLoading: boolean;       // True si está cargando.
  error: FirestoreError | Error | null; // Objeto de error, o null.
}

/**
 * Interfaz interna para acceder a propiedades no públicas de una Query de Firestore.
 * Se utiliza para obtener la ruta de la consulta para los mensajes de error.
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
 * Maneja referencias/consultas nulas.
 *
 * ¡IMPORTANTE! DEBES MEMOIZAR el `memoizedTargetRefOrQuery` de entrada usando `useMemoFirebase`,
 * o ocurrirán comportamientos inesperados (re-suscripciones infinitas).
 *  
 * @template T Tipo opcional para los datos del documento. Por defecto es `any`.
 * @param {CollectionReference | Query | null | undefined} memoizedTargetRefOrQuery -
 * La CollectionReference o Query de Firestore. Espera si es null/undefined.
 * @returns {UseCollectionResult<T>} Un objeto con `data`, `isLoading`, y `error`.
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
    // Si la referencia a la consulta es nula, resetea el estado.
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Crea el listener de Firestore.
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        // En caso de éxito, mapea los documentos a un array de resultados.
        const results: ResultItemType[] = [];
        for (const doc of snapshot.docs) {
          results.push({ ...(doc.data() as T), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        // En caso de error (ej. permisos), crea un error contextualizado.
        const path: string =
          memoizedTargetRefOrQuery.type === 'collection'
            ? (memoizedTargetRefOrQuery as CollectionReference).path
            : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
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
  }, [memoizedTargetRefOrQuery]); // Vuelve a ejecutar el efecto si la consulta/referencia cambia.

  // Comprobación en desarrollo para asegurar la memoización.
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' no fue correctamente memoizado usando useMemoFirebase');
  }
  
  return { data, isLoading, error };
}
