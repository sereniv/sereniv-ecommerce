export enum UserRole {
  ADMIN = "ADMIN",
  USER = "USER"
}

export interface User {
  id: string;
  firstName: string;
  lastName?: string | null;
  email: string;
  password: string;
  isVerified: boolean;
  isActive: boolean;
  role: UserRole;
  carts?: Cart[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id?: string;
  name: string;
  slug: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  variants: Variant[];
  isActive: boolean;
  isFeatured: boolean;
  categories: string[];
  tags: string[];
  ingredients: Ingredient[];
  faqs: Faq[];
  carts: Cart[];
  frequentlyBoughtProducts: string[];
  relatedProducts: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Variant {
  id?: string;
  product?: Product;
  productId?: string;
  size: string;
  price: number | string;
  stock: number | string;
  discount?: number | string | null;
  createdAt?: Date;
  updatedAt?: Date;
}


export interface Ingredient {
  id?: string;
  product?: Product;
  productId?: string;
  name: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Faq {
  id?: string;
  product?: Product;
  productId?: string;
  question: string;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Cart {
  id?: string;
  user?: User;
  userId?: string;
  product?: Product;
  productId?: string;
  quantity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}