
import type { Category, Product, User } from './types';

/**
 * Define las categorías principales de productos de la aplicación.
 */
export const CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Hamburguesas' },
  { id: 'sides', name: 'Entrantes' },
  { id: 'drinks', name: 'Bebidas' },
];

/**
 * Define los productos iniciales de la aplicación.
 * Estos datos se usarán para poblar la base de datos si está vacía.
 */
export const PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Konki Clásica',
    description: 'La que lo empezó todo. Una jugosa hamburguesa de ternera, queso cheddar, lechuga, tomate y nuestra salsa secreta Konki.',
    price: 9.99,
    category: 'burgers',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Bacon Blitz',
    description: '¡Una explosión de sabor! Hamburguesa de ternera, bacon crujiente, aros de cebolla y salsa BBQ.',
    price: 12.49,
    category: 'burgers',
    imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Viajera Vegetal',
    description: 'Una deliciosa y contundente hamburguesa vegetariana, con aguacate, brotes y una mayonesa vegana ácida.',
    price: 10.99,
    category: 'burgers',
    imageUrl: 'https://images.unsplash.com/photo-1521305916504-4a112118cc58?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Doble Problema',
    description: 'Dos hamburguesas de ternera, doble de queso, doble de bacon. No apto para cardíacos.',
    price: 15.99,
    category: 'burgers',
    imageUrl: 'https://images.unsplash.com/photo-1627907228175-2bf846a303b4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Hamburguesa Infierno',
    description: '¿Te atreves? Esta hamburguesa está cargada con chiles fantasma, jalapeños y un alioli de habanero ardiente.',
    price: 11.99,
    category: 'burgers',
    imageUrl: 'https://images.unsplash.com/photo-1594212699903-ec8a6e502067?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    name: 'Patatas Doradas',
    description: 'Perfectamente crujientes y saladas a la perfección. El acompañante ideal para cualquier hamburguesa.',
    price: 3.49,
    category: 'sides',
    imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb085dd77339?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Órbitas de Cebolla',
    description: 'Aros de cebolla gruesos, fritos hasta conseguir un crujido dorado.',
    price: 4.99,
    category: 'sides',
    imageUrl: 'https://images.unsplash.com/photo-1639585366434-a82404b96238?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Konki-Cola',
    description: 'Nuestra bebida gaseosa de autor. El refresco perfecto.',
    price: 2.49,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1554866585-CD94860890b7?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Batido Cósmico',
    description: 'Un rico y cremoso batido de vainilla que está fuera de este mundo.',
    price: 5.99,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'Crujipollo Errante',
    description: 'Un filete de pollo crujiente, pepinillos y nuestra salsa de autor en un pan de brioche.',
    price: 11.49,
    category: 'burgers',
    imageUrl: 'https://images.unsplash.com/photo-1626082929543-5bab896ba4ae?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
];

// Los datos de usuario ya no se siembran desde un archivo estático.
// El usuario administrador debe crearse a través de la página de registro de la aplicación.
export const USERS: User[] = [];
