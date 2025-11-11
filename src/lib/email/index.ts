// En una aplicación de producción, usarías un servicio como SendGrid, Mailgun o AWS SES.
// Instalarías su SDK (p. ej., `npm install @sendgrid/mail`) y lo configurarías con tu clave de API.
import sgMail from '@sendgrid/mail';
import type { Order } from "../types";

interface ConfirmationEmailPayload {
  to: string;
  name: string;
  orderId: string;
  pickupTime: string;
  total: number;
  items: Order["items"];
}

/**
 * Envía un correo de confirmación de pedido usando SendGrid si la API key está disponible.
 * Si no, simula el envío registrando en la consola.
 * @param payload - Los datos para el correo de confirmación.
 */
export async function sendOrderConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {

  // La clave de API se debe guardar de forma segura como una variable de entorno/secreto,
  // NUNCA directamente en el código. El sistema la leerá automáticamente desde `process.env`.
  if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const itemsHtml = payload.items.map(item => 
      `<li>${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}</li>`
    ).join('');

    // IMPORTANTE: El correo 'from' DEBE ser un correo que hayas verificado en tu cuenta de SendGrid.
    const msg = {
      to: payload.to,
      from: 'konkiburger@gmail.com', // Correo del remitente verificado en SendGrid.
      subject: `¡Tu pedido #${payload.orderId} de Konki Burger está confirmado!`,
      html: `
        <h1>Hola ${payload.name},</h1>
        <p>¡Buenas noticias! Tu pedido ha sido aceptado y estará listo para recoger a las <strong>${payload.pickupTime}</strong>.</p>
        <h3>Resumen del pedido:</h3>
        <ul>${itemsHtml}</ul>
        <h3>Total: $${payload.total.toFixed(2)}</h3>
        <p>¡Gracias por tu pedido!</p>
        <p>El equipo de Konki Burger</p>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`Correo real enviado a ${payload.to} a través de SendGrid.`);
    } catch (error: any) {
      console.error('Error al enviar correo con SendGrid:', error);
      // Este es el registro de diagnóstico que he añadido.
      if (error.response) {
        console.error('Cuerpo del error de SendGrid:', error.response.body);
      }
      throw error;
    }

  } else {
    // --- MODO DE SIMULACIÓN (si no hay clave de API) ---
    console.log("====================================");
    console.log("✉️ SIMULANDO ENVÍO DE CORREO (no se encontró API Key de SendGrid) ✉️");
    console.log("====================================");
    console.log(`Para: ${payload.to}`);
    console.log(`Asunto: ¡Tu pedido #${payload.orderId} de Konki Burger está confirmado!`);
    console.log("\n--- Cuerpo del mensaje ---\n");
    console.log(`Hola ${payload.name},\n`);
    console.log(`¡Buenas noticias! Tu pedido ha sido aceptado y estará listo para recoger a las ${payload.pickupTime}.\n`);
    console.log("Resumen del pedido:");
    payload.items.forEach(item => {
      console.log(`- ${item.quantity}x ${item.product.name} ($${(item.product.price * item.quantity).toFixed(2)})`);
    });
    console.log(`\nTotal: $${payload.total.toFixed(2)}\n`);
    console.log("¡Gracias por tu pedido!");
    console.log("El equipo de Konki Burger");
    console.log("\n====================================");
    console.log("✅ SIMULACIÓN COMPLETA ✅");
    console.log("====================================");
  }

  return Promise.resolve();
}
