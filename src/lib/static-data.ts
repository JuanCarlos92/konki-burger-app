import type { Category, Product, User } from './types';
import { PlaceHolderImages } from './placeholder-images';

export const CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Burgers' },
  { id: 'sides', name: 'Sides' },
  { id: 'drinks', name: 'Drinks' },
];

const getImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        return { src: 'https://picsum.photos/seed/error/600/400', alt: 'Placeholder', aiHint: 'placeholder' };
    }
    return { src: img.imageUrl, alt: img.description, aiHint: img.imageHint };
}

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Konki Classic',
    description: 'The one that started it all. A juicy beef patty, cheddar cheese, lettuce, tomato, and our secret Konki sauce.',
    price: 9.99,
    category: 'burgers',
    image: getImage('classic-burger'),
  },
  {
    id: '2',
    name: 'Bacon Blitz',
    description: 'A flavor explosion! Beef patty, crispy bacon, onion rings, and BBQ sauce.',
    price: 12.49,
    category: 'burgers',
    image: getImage('bacon-cheeseburger'),
  },
  {
    id: '3',
    name: 'Veggie Voyager',
    description: 'A delicious and hearty veggie patty, topped with avocado, sprouts, and a tangy vegan mayo.',
    price: 10.99,
    category: 'burgers',
    image: getImage('veggie-burger'),
  },
  {
    id: '4',
    name: 'Double Trouble',
    description: 'Two beef patties, double cheese, double bacon. Not for the faint of heart.',
    price: 15.99,
    category: 'burgers',
    image: getImage('double-decker'),
  },
  {
    id: '10',
    name: 'Inferno Burger',
    description: 'Feeling brave? This burger is loaded with ghost peppers, jalapeños, and a fiery habanero aioli.',
    price: 11.99,
    category: 'burgers',
    image: getImage('spicy-burger')
  },
  {
    id: '5',
    name: 'Golden Fries',
    description: 'Perfectly crispy and salted to perfection. The ideal companion to any burger.',
    price: 3.49,
    category: 'sides',
    image: getImage('french-fries'),
  },
  {
    id: '6',
    name: 'Onion Orbits',
    description: 'Thick-cut onion rings, fried to a golden-brown crisp.',
    price: 4.99,
    category: 'sides',
    image: getImage('onion-rings'),
  },
  {
    id: '7',
    name: 'Konki-Cola',
    description: 'Our signature sparkling beverage. The perfect refreshment.',
    price: 2.49,
    category: 'drinks',
    image: getImage('soda'),
  },
  {
    id: '8',
    name: 'Cosmic Shake',
    description: 'A rich and creamy vanilla milkshake that is out of this world.',
    price: 5.99,
    category: 'drinks',
    image: getImage('milkshake'),
  },
  {
    id: '9',
    name: 'Crispy Chicken Rover',
    description: 'A crispy chicken fillet, pickles, and our signature sauce on a brioche bun.',
    price: 11.49,
    category: 'burgers',
    image: getImage('chicken-sandwich')
  },
];

// User data is no longer seeded from a static file. 
// The admin user should be created through the app's registration page.
export const USERS: User[] = [];
