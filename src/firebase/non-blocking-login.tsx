'use client';
import {
  Auth, // Importa el tipo Auth para el tipado.
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';

/**
 * Inicia el inicio de sesión anónimo (sin bloqueo).
 * CRÍTICO: Llama a `signInAnonymously` directamente, sin `await`.
 * La ejecución del código continúa inmediatamente. El cambio de estado de autenticación
 * es manejado por el listener `onAuthStateChanged` en el proveedor de contexto.
 * @param {Auth} authInstance - La instancia del servicio de autenticación de Firebase.
 */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/**
 * Inicia el registro con email y contraseña (sin bloqueo).
 * CRÍTICO: Llama a `createUserWithEmailAndPassword` directamente, sin `await`.
 * @param {Auth} authInstance - La instancia del servicio de autenticación de Firebase.
 * @param {string} email - El email del usuario.
 * @param {string} password - La contraseña del usuario.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password);
}

/**
 * Inicia el inicio de sesión con email y contraseña (sin bloqueo).
 * CRÍTICO: Llama a `signInWithEmailAndPassword` directamente, sin `await`.
 * @param {Auth} authInstance - La instancia del servicio de autenticación de Firebase.
 * @param {string} email - El email del usuario.
 * @param {string} password - La contraseña del usuario.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
