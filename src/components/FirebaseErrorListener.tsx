'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Un componente invisible que escucha eventos de 'permission-error' emitidos globalmente.
 * Lanza cualquier error recibido para que sea capturado por el `error.tsx` global de Next.js,
 * mostrando una superposición de error en desarrollo.
 */
export function FirebaseErrorListener() {
  // Usa el tipo de error específico para el estado para mayor seguridad de tipos.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // La función de callback ahora espera un error fuertemente tipado, coincidiendo con el payload del evento.
    const handleError = (error: FirestorePermissionError) => {
      // Establece el error en el estado para provocar un nuevo renderizado.
      setError(error);
    };

    // El emisor tipado (`errorEmitter`) asegura que el callback para 'permission-error'
    // coincida con el tipo de payload esperado (FirestorePermissionError).
    errorEmitter.on('permission-error', handleError);

    // Se desuscribe en el desmontaje para prevenir fugas de memoria.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // En el nuevo renderizado, si existe un error en el estado, lo lanza.
  if (error) {
    throw error;
  }

  // Este componente no renderiza nada.
  return null;
}
