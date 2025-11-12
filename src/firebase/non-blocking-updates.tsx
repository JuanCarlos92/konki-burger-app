'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * Inicia una operación `setDoc` (crear o sobrescribir) para una referencia de documento.
 * NO espera a que la operación de escritura termine. La ejecución continúa inmediatamente.
 * Captura errores de permisos y los emite globalmente.
 * @param {DocumentReference} docRef - La referencia al documento.
 * @param {any} data - Los datos a escribir.
 * @param {SetOptions} options - Opciones de `setDoc` (ej. `{ merge: true }`).
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write',
        requestResourceData: data,
      })
    )
  })
}

/**
 * Inicia una operación `addDoc` (añadir un nuevo documento con ID autogenerado) para una referencia de colección.
 * NO espera a que la operación termine.
 * @param {CollectionReference} colRef - La referencia a la colección.
 * @param {any} data - Los datos del nuevo documento.
 * @returns La promesa de la operación, aunque típicamente no es esperada por quien la llama.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}

/**
 * Inicia una operación `updateDoc` para una referencia de documento.
 * NO espera a que la operación termine.
 * @param {DocumentReference} docRef - La referencia al documento a actualizar.
 * @param {any} data - Los campos a actualizar.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}

/**
 * Inicia una operación `deleteDoc` para una referencia de documento.
 * NO espera a que la operación termine.
 * @param {DocumentReference} docRef - La referencia al documento a eliminar.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
