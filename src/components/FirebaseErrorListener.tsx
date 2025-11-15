'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Un componente "invisible" que actúa como un oyente global para errores de permisos de Firestore.
 * Cuando se emite un evento 'permission-error' a través de `errorEmitter`, este componente
 * captura el error y lo "lanza" (`throw`).
 * 
 * En el entorno de desarrollo de Next.js, esto hace que aparezca la superposición de error
 * (error overlay), mostrando los detalles del error contextualizado que generamos,
 * lo cual es extremadamente útil para depurar las Reglas de Seguridad de Firestore.
 */
export function FirebaseErrorListener() {
  // Se usa el tipo de error específico (`FirestorePermissionError`) para el estado,
  // lo que proporciona mayor seguridad de tipos.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // La función de callback ahora espera un error fuertemente tipado, coincidiendo con el payload del evento.
    const handleError = (error: FirestorePermissionError) => {
      // Establece el error en el estado para provocar un nuevo renderizado.
      setError(error);
    };

    // El emisor tipado (`errorEmitter`) asegura que el callback para 'permission-error'
    // coincida con el tipo de payload esperado (`FirestorePermissionError`).
    errorEmitter.on('permission-error', handleError);

    // Función de limpieza: se desuscribe del listener cuando el componente se desmonta
    // para prevenir fugas de memoria.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // En el nuevo renderizado, si existe un error en el estado, lo lanza.
  // Esto es lo que activa la superposición de error de Next.js.
  if (error) {
    throw error;
  }

  // Este componente no renderiza nada visible en la interfaz de usuario.
  return null;
}
