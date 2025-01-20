import type { Request, Response } from 'express';
import { type Filter } from 'mongodb';
import { responseService } from '../../services/response/service.ts';
import { productsService } from './products.service.ts';
import type { Product } from './types.ts';

export class ProductsController {
  async getAllProducts(req: Request, res: Response) {
    const { page = 1, limit = 10, sort, filter } = req.query;
    const products = await productsService.find({
      filter: filter ? (JSON.parse(filter as string) as Filter<Product>) : undefined,
      limit: Number(limit),
      skip: (Number(page) - 1) * Number(limit),
      sort: sort ? JSON.parse(sort as string) : undefined,
    });

    return responseService.success(res, { data: products });
  }

  async getProductById(req: Request, res: Response) {
    const { id } = req.params;

    const product = await productsService.findOne(id as string);

    if (!product) {
      return responseService.notFound(res, { message: 'Product not found' });
    }

    return responseService.success(res, { data: product });
  }

  async createProduct(req: Request, res: Response) {
    const productData = req.body;
    const product = await productsService.create(productData);

    return responseService.created(res, { data: product });
  }

  async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;

    const product = await productsService.update(id as string, updateData);

    if (!product) {
      return responseService.notFound(res, { message: 'Product not found' });
    }

    return responseService.success(res, { data: product });
  }

  async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = await productsService.delete(id as string);

    if (!deleted) {
      return responseService.notFound(res, { message: 'Product not found' });
    }

    return responseService.success(res, { message: 'Product deleted successfully' });
  }
}

export const productsController = new ProductsController();
