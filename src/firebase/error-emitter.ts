'use client';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Define la "forma" de todos los eventos de error posibles y sus correspondientes tipos de payload.
 * Centralizar estas definiciones proporciona seguridad de tipos en toda la aplicación cuando
 * se emiten o se escuchan eventos.
 */
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// Un tipo genérico para una función de callback (oyente de eventos).
type Callback<T> = (data: T) => void;

/**
 * Crea un emisor de eventos (event emitter) de tipo pub/sub que es fuertemente tipado.
 * Utiliza un tipo genérico `T` que debe extender un registro de nombres de eventos a tipos de payload.
 * Esto garantiza que solo se puedan emitir eventos definidos y con el payload correcto.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // El objeto `events` almacena arrays de callbacks, indexados por el nombre del evento.
  // Los tipos aseguran que un callback para un evento específico coincida con su tipo de payload.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    /**
     * Se suscribe a un evento para recibir notificaciones.
     * @param eventName El nombre del evento al que suscribirse.
     * @param callback La función que se llamará cuando se emita el evento.
     */
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    /**
     * Se da de baja de un evento para dejar de recibir notificaciones.
     * @param eventName El nombre del evento del que darse de baja.
     * @param callback El callback específico a eliminar de la lista de suscriptores.
     */
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    /**
     * Publica (emite) un evento a todos los suscriptores registrados.
     * @param eventName El nombre del evento a emitir.
     * @param data El payload de datos que corresponde al tipo del evento.
     */
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

// Crea y exporta una instancia singleton del emisor de eventos, tipada con nuestra interfaz `AppEvents`.
// Este `errorEmitter` se usará en toda la aplicación para manejar errores de forma centralizada.
export const errorEmitter = createEventEmitter<AppEvents>();
