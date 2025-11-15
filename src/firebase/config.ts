/**
 * Objeto de configuración de Firebase.
 * 
 * Estos valores se obtienen desde la consola de Firebase al registrar una nueva aplicación web
 * en la configuración del proyecto. Son necesarios para que el SDK de Firebase en el cliente
 * sepa a qué proyecto de Firebase conectarse.
 * 
 * Es seguro exponer estas claves en el lado del cliente. La seguridad de los datos no depende
 * de mantener estas claves en secreto, sino de las Reglas de Seguridad de Firestore y,
 * opcionalmente, de Firebase App Check, que se configuran en el backend de Firebase.
 */
export const firebaseConfig = {
  "projectId": "studio-5462023559-5db14",
  "appId": "1:101479255119:web:dc1bf08021ee62ec33ae3a",
  "apiKey": "AIzaSyDnrUsD3R1tsV_l2FpSk6hvd_7wOBhZWJI",
  "authDomain": "studio-5462023559-5db14.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "101479255119"
};
