"use server";

import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Order } from "@/lib/types";

/**
 * Server Action para iniciar el envío de un correo de confirmación de pedido.
 * Se llama desde el lado del cliente (AppContext) pero se ejecuta de forma segura en el servidor.
 * @param order - El objeto completo del pedido.
 */
export async function sendConfirmationEmailAction(order: Order) {
  // Se elimina el try...catch para permitir que los errores se propaguen al cliente.
  // El cliente (AppContext) será ahora responsable de manejar los errores de envío.
  await sendOrderConfirmationEmail({
    to: order.customer.email,
    name: order.customer.name,
    orderId: order.id,
    pickupTime: order.pickupTime || "No especificado",
    total: order.total,
    items: order.items,
  });

  // Si sendOrderConfirmationEmail se ejecuta sin errores, devolvemos éxito.
  // Si lanza un error, la promesa de esta acción será rechazada, y el cliente lo capturará.
  return { success: true, message: "Proceso de envío de correo iniciado." };
}
