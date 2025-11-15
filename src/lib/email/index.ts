"use server";

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
 * Envía un correo de confirmación de pedido usando Nodemailer con Gmail.
 * Las credenciales se cargan de forma segura desde las variables de entorno/secretos.
 * @param {ConfirmationEmailPayload} payload - Los datos para el correo de confirmación.
 */
export async function sendOrderConfirmationEmail(payload: ConfirmationEmailPayload): Promise<void> {

  // Crea un "transportador" reutilizable usando el servicio SMTP de Gmail.
  // Las credenciales se obtienen de las variables de entorno, que se configuran
  // como secretos en Firebase App Hosting.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Tu dirección de Gmail.
      pass: process.env.GMAIL_APP_PASSWORD, // La contraseña de aplicación de 16 caracteres.
    },
  });

  // Construye el cuerpo del correo en formato HTML para un mejor aspecto.
  const emailBody = `
    <h1>¡Pedido Confirmado!</h1>
    <p>Hola ${payload.name},</p>
    <p>¡Buenas noticias! Tu pedido <strong>#${payload.orderId}</strong> ha sido aceptado y estará listo para recoger a las <strong>${payload.pickupTime}</strong>.</p>
    <h3>Resumen del pedido:</h3>
    <ul>
      ${payload.items.map(item => 
        `<li>${item.quantity}x ${item.product.name} - $${(item.product.price * item.quantity).toFixed(2)}</li>`
      ).join('')}
    </ul>
    <h3>Total: $${payload.total.toFixed(2)}</h3>
    <p>¡Gracias por tu pedido!</p>
    <p>El equipo de Konki Burger</p>
  `;

  // Define las opciones del correo (de, para, asunto, cuerpo).
  const mailOptions = {
    from: `"Konki Burger" <${process.env.GMAIL_USER}>`, // Dirección del remitente.
    to: payload.to, // Dirección del destinatario.
    subject: `¡Tu pedido #${payload.orderId} de Konki Burger está confirmado!`, // Asunto.
    html: emailBody, // Cuerpo del correo en HTML.
  };

  // Envía el correo usando el transportador.
  await transporter.sendMail(mailOptions);
  
  console.log(`Correo de confirmación enviado a ${payload.to}`);
}
