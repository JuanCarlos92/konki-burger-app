import type { Timestamp } from 'firebase/firestore';

/**
 * Representa una categoría de producto (p.ej., "Hamburguesas", "Bebidas").
 */
export type Category = {
  id: string; // ID único, generalmente un slug como "burgers".
  name: string; // Nombre legible para mostrar, como "Hamburguesas".
};

/**
 * Representa un producto individual en el menú.
 */
export type Product = {
  id: string; // ID único del producto.
  name: string; // Nombre del producto (p.ej., "Konki Clásica").
  description: string; // Descripción detallada del producto.
  price: number; // Precio del producto.
  category: string; // ID de la categoría a la que pertenece, para filtrado.
  imageUrl: string; // URL de la imagen del producto.
};

/**
 * Representa un artículo dentro del carrito de compras.
 * Combina un producto con la cantidad seleccionada.
 */
export type CartItem = {
  product: Product; // El objeto completo del producto.
  quantity: number; // La cantidad de este producto en el carrito.
};

/**
 * Representa un usuario registrado en la aplicación.
 */
export type User = {
  id: string; // ID único del usuario (coincide con el UID de Firebase Auth).
  name: string; // Nombre del usuario.
  email: string; // Email del usuario.
  address: string; // Dirección del usuario.
};

/**
 * Representa un pedido realizado por un usuario.
 */
export type Order = {
  id: string; // ID único del pedido.
  userId: string; // ID del usuario que realizó el pedido, o 'guest' para pedidos anónimos.
  items: {
    // Los datos clave del producto se desnormalizan y se almacenan directamente en el pedido.
    // Esto asegura que el pedido mantenga un registro histórico preciso, incluso si el
    // producto original se modifica o elimina del menú en el futuro.
    product: {
      id: string;
      name: string;
      price: number;
      imageUrl: string;
    };
    quantity: number;
  }[];
  total: number; // Costo total del pedido.
  status: 'Pending' | 'Accepted' | 'Rejected'; // Estado actual del pedido, gestionado por el administrador.
  createdAt: Timestamp | Date; // Fecha y hora de creación del pedido. Puede ser un Timestamp de Firestore o un objeto Date.
  pickupTime?: string; // Hora de recogida asignada por el administrador (opcional).
  customer: {
    // Datos del cliente en el momento de la compra. Se desnormalizan para que el pedido sea autocontenido.
    name: string;
    email: string;
    address: string;
  };
};
