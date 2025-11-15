"use server";

import { sendOrderConfirmationEmail } from "@/lib/email";
import type { Order } from "@/lib/types";

/**
 * Server Action para iniciar el envío de un correo de confirmación de pedido.
 * Esta función se invoca desde componentes del cliente y ejecuta la lógica de envío de correo
 * de forma segura en el servidor.
 * 
 * @param {Order} order - El objeto completo del pedido que contiene los detalles para el correo.
 * @returns {Promise<{success: boolean, message: string}>} Un objeto que indica si el envío fue exitoso
 * y proporciona un mensaje descriptivo.
 */
export async function sendConfirmationEmailAction(order: Order) {
  try {
    // Llama a la función que realmente configura y envía el correo usando Nodemailer.
    await sendOrderConfirmationEmail({
      to: order.customer.email,
      name: order.customer.name,
      orderId: order.id,
      pickupTime: order.pickupTime || "No especificada",
      total: order.total,
      items: order.items,
    });
    // Si el envío es exitoso, devuelve un objeto de éxito.
    return { success: true, message: "Correo de confirmación enviado exitosamente." };
  } catch (error) {
    // Si hay un error durante el envío, lo captura, lo registra y devuelve un objeto de fallo.
    console.error("Error en sendConfirmationEmailAction:", error);
    return { success: false, message: "No se pudo enviar el correo de confirmación." };
  }
}
