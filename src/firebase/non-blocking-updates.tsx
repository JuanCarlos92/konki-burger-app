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
 * Inicia una operación `setDoc` (crear o sobrescribir) para una referencia de documento de forma no bloqueante.
 * NO espera a que la operación de escritura termine en el servidor. La ejecución del código continúa inmediatamente.
 * Captura errores de permisos y los emite globalmente a través de `errorEmitter`.
 * @param {DocumentReference} docRef - La referencia al documento que se va a escribir.
 * @param {any} data - Los datos que se van a escribir en el documento.
 * @param {SetOptions} options - Opciones de `setDoc` (p. ej., `{ merge: true }` para actualizar campos en lugar de sobrescribir).
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    // Si la operación falla (p.ej. por reglas de seguridad), se crea un error contextualizado.
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // 'write' cubre tanto creación como actualización.
        requestResourceData: data,
      })
    )
  })
}

/**
 * Inicia una operación `addDoc` (añadir un nuevo documento con un ID autogenerado) a una colección.
 * NO espera a que la operación termine.
 * @param {CollectionReference} colRef - La referencia a la colección donde se añadirá el documento.
 * @param {any} data - Los datos del nuevo documento.
 * @returns La promesa de la operación `addDoc`, aunque típicamente no es esperada por quien la llama.
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
 * @param {DocumentReference} docRef - La referencia al documento que se va a actualizar.
 * @param {any} data - Un objeto con los campos y valores a actualizar.
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
 * @param {DocumentReference} docRef - La referencia al documento que se va a eliminar.
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
