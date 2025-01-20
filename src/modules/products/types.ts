import type { Document, Filter } from 'mongodb';

export interface Product extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FindOptions {
  filter?: Filter<Product> | undefined;
  limit?: number | undefined;
  skip?: number | undefined;
  sort?: Record<string, 1 | -1> | undefined;
}
