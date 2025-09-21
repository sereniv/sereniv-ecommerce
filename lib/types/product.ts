export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  images?: string[];
  price: number;
  weight?: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
}