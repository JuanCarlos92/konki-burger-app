'use client';
import { getAuth, type User } from 'firebase/auth';

/**
 * Contexto de una regla de seguridad de Firestore.
 * Define la operación que falló.
 */
type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any; // Datos que se intentaron escribir/actualizar.
};

/**
 * Simula el objeto `request.auth.token` disponible en las reglas de seguridad.
 */
interface FirebaseAuthToken {
  name: string | null;
  email: string | null;
  email_verified: boolean;
  phone_number: string | null;
  sub: string; // El UID del usuario.
  firebase: {
    identities: Record<string, string[]>;
    sign_in_provider: string;
    tenant: string | null;
  };
}

/**
 * Simula el objeto `request.auth` disponible en las reglas de seguridad.
 */
interface FirebaseAuthObject {
  uid: string;
  token: FirebaseAuthToken;
}

/**
 * Simula el objeto `request` completo disponible en las reglas de seguridad.
 */
interface SecurityRuleRequest {
  auth: FirebaseAuthObject | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

/**
 * Construye un objeto `auth` compatible con las reglas de seguridad a partir del objeto User de Firebase.
 * @param currentUser El usuario de Firebase actualmente autenticado.
 * @returns Un objeto que imita a `request.auth` en las reglas de seguridad, o null.
 */
function buildAuthObject(currentUser: User | null): FirebaseAuthObject | null {
  if (!currentUser) {
    return null;
  }

  const token: FirebaseAuthToken = {
    name: currentUser.displayName,
    email: currentUser.email,
    email_verified: currentUser.emailVerified,
    phone_number: currentUser.phoneNumber,
    sub: currentUser.uid,
    firebase: {
      identities: currentUser.providerData.reduce((acc, p) => {
        if (p.providerId) {
          acc[p.providerId] = [p.uid];
        }
        return acc;
      }, {} as Record<string, string[]>),
      sign_in_provider: currentUser.providerData[0]?.providerId || 'custom',
      tenant: currentUser.tenantId,
    },
  };

  return {
    uid: currentUser.uid,
    token: token,
  };
}

/**
 * Construye el objeto de solicitud simulado completo para el mensaje de error.
 * Intenta obtener de forma segura el usuario autenticado actual.
 * @param context El contexto de la operación de Firestore que falló.
 * @returns Un objeto de solicitud estructurado.
 */
function buildRequestObject(context: SecurityRuleContext): SecurityRuleRequest {
  let authObject: FirebaseAuthObject | null = null;
  try {
    const firebaseAuth = getAuth();
    const currentUser = firebaseAuth.currentUser;
    if (currentUser) {
      authObject = buildAuthObject(currentUser);
    }
  } catch {
    // Esto captura errores si la aplicación de Firebase aún no está inicializada.
  }

  return {
    auth: authObject,
    method: context.operation,
    path: `/databases/(default)/documents/${context.path}`,
    resource: context.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

/**
 * Construye el mensaje de error final y formateado para el LLM.
 * @param requestObject El objeto de solicitud simulado.
 * @returns Una cadena que contiene el mensaje de error y el payload JSON.
 */
function buildErrorMessage(requestObject: SecurityRuleRequest): string {
  return `Permisos insuficientes o ausentes: La siguiente solicitud fue denegada por las Reglas de Seguridad de Firestore:
${JSON.stringify(requestObject, null, 2)}`;
}

/**
 * Una clase de error personalizada diseñada para ser consumida por un LLM para depuración.
 * Estructura la información del error para imitar el objeto de solicitud
 * disponible en las Reglas de Seguridad de Firestore.
 */
export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(buildErrorMessage(requestObject));
    this.name = 'FirebaseError';
    this.request = requestObject;
  }
}
