import type { Timestamp } from 'firebase/firestore';

/**
 * Representa una categoría de producto.
 */
export type Category = {
  id: string;
  name: string;
};

/**
 * Representa un producto en el menú.
 */
export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string; // ID de la categoría a la que pertenece.
  image: {
    src: string; // URL de la imagen.
    alt: string; // Texto alternativo para accesibilidad.
    aiHint: string; // Pista para buscar imágenes de IA.
  };
};

/**
 * Representa un artículo en el carrito de compras.
 */
export type CartItem = {
  product: Product;
  quantity: number;
};

/**
 * Representa un usuario registrado en la aplicación.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  address: string;
};

/**
 * Representa un pedido realizado por un usuario.
 */
export type Order = {
  id: string;
  userId: string; // ID del usuario que realizó el pedido, o 'guest' para anónimos.
  items: {
    // Los datos del producto se desnormalizan aquí para mantener un registro histórico del pedido,
    // incluso si el producto original se modifica o elimina.
    product: {
      id: string;
      name: string;
      price: number;
      image: {
        src: string;
        alt: string;
        aiHint: string;
      };
    };
    quantity: number;
  }[];
  total: number; // Costo total del pedido.
  status: 'Pending' | 'Accepted' | 'Rejected'; // Estado actual del pedido.
  createdAt: Timestamp | Date; // Fecha de creación del pedido.
  pickupTime?: string; // Hora de recogida asignada (opcional).
  customer: {
    name: string;
    email: string;
    address: string;
  };
};
