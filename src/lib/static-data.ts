import type { Category, Product, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

/**
 * Define las categorías principales de productos de la aplicación.
 */
export const CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Hamburguesas' },
  { id: 'sides', name: 'Acompañamientos' },
  { id: 'drinks', name: 'Bebidas' },
];

/**
 * Obtiene los datos de una imagen placeholder por su ID.
 * @param {string} id - El ID de la imagen a buscar.
 * @returns Un objeto con la URL, texto alternativo y una pista para IA.
 */
const getImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        // Devuelve una imagen de error si no se encuentra el ID.
        return { src: 'https://picsum.photos/seed/error/600/400', alt: 'Placeholder', aiHint: 'placeholder' };
    }
    return { src: img.imageUrl, alt: img.description, aiHint: img.imageHint };
}

/**
 * Define los productos iniciales de la aplicación.
 * Estos datos se usarán para poblar la base de datos si está vacía.
 */
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Konki Clásica',
    description: 'La que lo empezó todo. Una jugosa hamburguesa de ternera, queso cheddar, lechuga, tomate y nuestra salsa secreta Konki.',
    price: 9.99,
    category: 'burgers',
    image: getImage('classic-burger'),
  },
  {
    id: '2',
    name: 'Bacon Blitz',
    description: '¡Una explosión de sabor! Hamburguesa de ternera, bacon crujiente, aros de cebolla y salsa BBQ.',
    price: 12.49,
    category: 'burgers',
    image: getImage('bacon-cheeseburger'),
  },
  {
    id: '3',
    name: 'Viajera Vegetal',
    description: 'Una deliciosa y contundente hamburguesa vegetariana, con aguacate, brotes y una mayonesa vegana ácida.',
    price: 10.99,
    category: 'burgers',
    image: getImage('veggie-burger'),
  },
  {
    id: '4',
    name: 'Doble Problema',
    description: 'Dos hamburguesas de ternera, doble de queso, doble de bacon. No apto para cardíacos.',
    price: 15.99,
    category: 'burgers',
    image: getImage('double-decker'),
  },
  {
    id: '10',
    name: 'Hamburguesa Infierno',
    description: '¿Te atreves? Esta hamburguesa está cargada con chiles fantasma, jalapeños y un alioli de habanero ardiente.',
    price: 11.99,
    category: 'burgers',
    image: getImage('spicy-burger')
  },
  {
    id: '5',
    name: 'Patatas Doradas',
    description: 'Perfectamente crujientes y saladas a la perfección. El acompañante ideal para cualquier hamburguesa.',
    price: 3.49,
    category: 'sides',
    image: getImage('french-fries'),
  },
  {
    id: '6',
    name: 'Órbitas de Cebolla',
    description: 'Aros de cebolla gruesos, fritos hasta conseguir un crujido dorado.',
    price: 4.99,
    category: 'sides',
    image: getImage('onion-rings'),
  },
  {
    id: '7',
    name: 'Konki-Cola',
    description: 'Nuestra bebida gaseosa de autor. El refresco perfecto.',
    price: 2.49,
    category: 'drinks',
    image: getImage('soda'),
  },
  {
    id: '8',
    name: 'Batido Cósmico',
    description: 'Un rico y cremoso batido de vainilla que está fuera de este mundo.',
    price: 5.99,
    category: 'drinks',
    image: getImage('milkshake'),
  },
  {
    id: '9',
    name: 'Crujipollo Errante',
    description: 'Un filete de pollo crujiente, pepinillos y nuestra salsa de autor en un pan de brioche.',
    price: 11.49,
    category: 'burgers',
    image: getImage('chicken-sandwich')
  },
];

// Los datos de usuario ya no se siembran desde un archivo estático.
// El usuario administrador debe crearse a través de la página de registro de la aplicación.
export const USERS: User[] = [];
