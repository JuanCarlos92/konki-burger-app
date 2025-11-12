// En una aplicación de producción, usarías un servicio como Nodemailer, SendGrid, Mailgun o AWS SES.
// Instalarías su SDK (p. ej., `npm install nodemailer`) y lo configurarías con tus credenciales.
import nodemailer from 'nodemailer';
import type { Order } from "../types";

/**
 * Define la estructura de los datos necesarios para enviar un correo de confirmación.
 * @property {string} to - La dirección de correo electrónico del destinatario.
 * @property {string} name - El nombre del destinatario.
 * @property {string} orderId - El identificador único del pedido.
 * @property {string} pickupTime - La hora de recogida programada para el pedido.
 * @property {number} total - El importe total del pedido.
 * @property {Order["items"]} items - Un array con los artículos del pedido.
 */
interface ConfirmationEmailPayload {
  to: string;
  name: string;
  orderId: string;
  pickupTime: string;
  total: number;
  items: Order["items"];
}

/**
 * Envía un correo de confirmación de pedido usando Nodemailer con Gmail si las credenciales están disponibles.
 * Si no, simula el envío registrando en la consola para depuración.
 * @param {ConfirmationEmailPayload} payload - Los datos para el correo de confirmación.
 * @throws {Error} Lanza un error si el envío con Nodemailer falla.
 */
export async function sendOrderConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {

  console.log('--- DIAGNÓSTICO DE ENVÍO DE CORREO ---');
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    console.log('Credenciales de Gmail ENCONTRADAS. Intentando enviar correo real.');
  } else {
    console.log('Credenciales de Gmail NO ENCONTRADAS. Se procederá con la simulación.');
  }
  console.log('------------------------------------');

  // Las credenciales se deben guardar de forma segura como variables de entorno/secretos,
  // NUNCA directamente en el código. App Hosting las inyectará en `process.env`.
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    // Crea un "transportador" reutilizable con la configuración para Gmail.
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD, // ¡IMPORTANTE! Usa una contraseña de aplicación, no tu contraseña normal.
      },
    });

    // Construye el HTML para la lista de artículos del pedido.
    const itemsHtml = payload.items.map(item => 
      `<li>${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}</li>`
    ).join('');

    // Define las opciones del correo.
    const mailOptions = {
      from: `"Konki Burger" <${process.env.GMAIL_USER}>`, // Dirección del remitente (tu cuenta de Gmail)
      to: payload.to, // Dirección del destinatario
      subject: `¡Tu pedido #${payload.orderId} de Konki Burger está confirmado!`, // Asunto del correo
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
      await transporter.sendMail(mailOptions);
      console.log(`Correo real enviado a ${payload.to} a través de Nodemailer.`);
    } catch (error: any) {
      console.error('Error al enviar correo con Nodemailer. Este es el error completo:');
      console.error(error);
      // CRÍTICO: Volver a lanzar el error para que la Server Action sepa que algo falló.
      throw new Error(`Fallo en el envío con Nodemailer: ${error.message}`);
    }

  } else {
    // --- MODO DE SIMULACIÓN (si no hay credenciales) ---
    console.log("====================================");
    console.log("✉️ SIMULANDO ENVÍO DE CORREO (no se encontraron credenciales de Gmail) ✉️");
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
}
