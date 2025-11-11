"use server";

import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Order } from "@/lib/types";

/**
 * Server Action para iniciar el envío de un correo de confirmación de pedido.
 * Se llama desde el lado del cliente (AppContext) pero se ejecuta de forma segura en el servidor.
 * @param order - El objeto completo del pedido.
 */
export async function sendConfirmationEmailAction(order: Order) {
  try {
    // En una aplicación real, podrías volver a obtener los detalles más actualizados del pedido
    // aquí para garantizar la integridad de los datos antes de enviar el correo.

    await sendOrderConfirmationEmail({
      to: order.customer.email,
      name: order.customer.name,
      orderId: order.id,
      pickupTime: order.pickupTime || "No especificado",
      total: order.total,
      items: order.items,
    });

    // Si sendOrderConfirmationEmail se ejecuta sin errores, devolvemos éxito.
    return { success: true, message: "Proceso de envío de correo iniciado." };
  } catch (error) {
    console.error("Error en sendConfirmationEmailAction:", error);
    // En una aplicación real, querrías registrar esto en un servicio de monitoreo adecuado.
    // Ahora, si sendOrderConfirmationEmail lanza un error, se capturará aquí y se devolverá 'success: false'.
    return { success: false, message: "No se pudo iniciar el proceso de envío de correo." };
  }
}
