'use client';
import {
  Auth, // Importa el tipo `Auth` para el tipado fuerte de la instancia de autenticación.
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/**
 * Inicia el proceso de inicio de sesión anónimo sin bloquear el hilo principal.
 * CRÍTICO: Llama a `signInAnonymously` directamente, sin usar `await`.
 * La ejecución del código continúa inmediatamente. El cambio de estado de autenticación
 * será detectado por el listener `onAuthStateChanged` que está activo en el proveedor de contexto,
 * el cual se encargará de actualizar la UI de forma reactiva.
 * @param {Auth} authInstance - La instancia del servicio de autenticación de Firebase.
 */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/**
 * Inicia el proceso de registro de un nuevo usuario con email y contraseña (sin bloqueo).
 * CRÍTICO: Llama a `createUserWithEmailAndPassword` directamente, sin `await`.
 * @param {Auth} authInstance - La instancia del servicio de autenticación de Firebase.
 * @param {string} email - El email del nuevo usuario.
 * @param {string} password - La contraseña del nuevo usuario.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/**
 * Inicia el proceso de inicio de sesión con email y contraseña (sin bloqueo).
 * CRÍTICO: Llama a `signInWithEmailAndPassword` directamente, sin `await`.
 * @param {Auth} authInstance - La instancia del servicio de autenticación de Firebase.
 * @param {string} email - El email del usuario.
 * @param {string} password - La contraseña del usuario.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
