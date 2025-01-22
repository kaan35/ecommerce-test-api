import type { Filter, ObjectId } from 'mongodb';

export type Product = {
  _id?: ObjectId;
  name: string;
  price: number;
  category: string;
  createdAt: string;
  updatedAt: string;
  createdAtTimestamp: string;
  updatedAtTimestamp: string;
};

export type CreateProductDTO = {
  name: string;
  price: number;
  category: string;
};

export type UpdateProductDTO = Partial<CreateProductDTO>;

export interface FindOptions {
  filter?: Filter<Product> | undefined;
  limit?: number | undefined;
  skip?: number | undefined;
  sort?: Record<string, 1 | -1> | undefined;
}

export class InvalidProductIdError extends Error {
  constructor(message = 'Product ID is required') {
    super(message);
    this.name = 'InvalidProductIdError';
  }
}
