import type { Timestamp } from 'firebase/firestore';

export type Category = {
  id: string;
  name: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: {
    src: string;
    alt: string;
    aiHint: string;
  };
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  address: string;
};

export type Order = {
  id: string;
  userId: string;
  items: {
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
  total: number;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: Timestamp | Date;
  pickupTime?: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
};
