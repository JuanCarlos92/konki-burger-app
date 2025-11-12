'use client';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Define la forma de todos los eventos posibles y sus correspondientes tipos de payload.
 * Esto centraliza las definiciones de eventos para la seguridad de tipos en toda la aplicación.
 */
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// Un tipo genérico para una función de callback.
type Callback<T> = (data: T) => void;

/**
 * Un emisor de eventos pub/sub fuertemente tipado.
 * Utiliza un tipo genérico T que extiende un registro de nombres de eventos a tipos de payload.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // El objeto `events` almacena arrays de callbacks, indexados por nombre de evento.
  // Los tipos aseguran que un callback para un evento específico coincida con su tipo de payload.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    /**
     * Suscribirse a un evento.
     * @param eventName El nombre del evento al que suscribirse.
     * @param callback La función a llamar cuando se emite el evento.
     */
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    /**
     * Darse de baja de un evento.
     * @param eventName El nombre del evento del que darse de baja.
     * @param callback El callback específico a eliminar.
     */
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    /**
     * Publicar un evento a todos los suscriptores.
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

// Crea y exporta una instancia singleton del emisor, tipada con nuestra interfaz AppEvents.
export const errorEmitter = createEventEmitter<AppEvents>();
