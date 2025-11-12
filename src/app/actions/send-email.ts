"use server";

import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Order } from "@/lib/types";

/**
 * Server Action para iniciar el envío de un correo de confirmación de pedido.
 * Esta función se invoca desde el lado del cliente (en AppContext) pero se ejecuta 
 * de forma segura en el servidor, protegiendo así las credenciales.
 * 
 * @param {Order} order - El objeto completo del pedido, que contiene los detalles para el correo.
 * @returns {Promise<{success: boolean, message: string}>} Un objeto que indica si la operación fue exitosa.
 * @throws {Error} Lanza un error si el envío del correo falla, permitiendo que el cliente lo capture.
 */
export async function sendConfirmationEmailAction(order: Order) {
  // Se elimina el bloque try...catch para permitir que los errores se propaguen hacia el cliente.
  // El cliente que llama a esta acción (AppContext) será ahora responsable de manejar los errores de envío.
  // Esto hace que la interfaz de usuario pueda reaccionar a fallos (ej. mostrar una notificación de error).
  await sendOrderConfirmationEmail({
    to: order.customer.email,
    name: order.customer.name,
    orderId: order.id,
    pickupTime: order.pickupTime || "No especificado",
    total: order.total,
    items: order.items,
  });

  // Si la función `sendOrderConfirmationEmail` se ejecuta sin lanzar un error,
  // esta acción devolverá una promesa que se resuelve con un objeto de éxito.
  // Si lanza un error, la promesa de esta acción será rechazada, y el `.catch()` en el cliente se activará.
  return { success: true, message: "Proceso de envío de correo iniciado." };
}
