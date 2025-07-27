import type { Request, Response } from 'express';
import { type Filter } from 'mongodb';
import { errorService } from '../../services/error/service.ts';
import { responseService } from '../../services/response/service.ts';
import { productsService } from './products.service.ts';
import type { Product } from './types.ts';

export class ProductsController {
  async getAll(req: Request, res: Response): Promise<void> {
    const { page = 1, limit = 10, sort, filter } = req.query;

    await productsService
      .find({
        filter: filter ? (JSON.parse(filter as string) as Filter<Product>) : undefined,
        limit: Number(limit),
        skip: (Number(page) - 1) * Number(limit),
        sort: sort ? JSON.parse(sort as string) : undefined,
      })
      .then((products) => responseService.success(res, { data: products }))
      .catch((error) => errorService.handleError(error, res, 'database'));
  }

  async getById(req: Request, res: Response): Promise<void> {
    await productsService
      .findOne(req.params.id || '')
      .then((product) => responseService.success(res, { data: product }))
      .catch((error) => errorService.handleError(error, res, 'database'));
  }

  async create(req: Request, res: Response): Promise<void> {
    await productsService
      .create(req.body)
      .then((product) => responseService.created(res, { data: product }))
      .catch((error) => errorService.handleError(error, res, 'database'));
  }

  async update(req: Request, res: Response): Promise<void> {
    await productsService
      .update(req.params.id || '', req.body)
      .then((product) => responseService.success(res, { data: product }))
      .catch((error) => errorService.handleError(error, res, 'database'));
  }

  async delete(req: Request, res: Response): Promise<void> {
    await productsService
      .delete(req.params.id || '')
      .then(() => responseService.success(res, { message: 'Product deleted successfully' }))
      .catch((error) => errorService.handleError(error, res, 'database'));
  }
}

export const productsController = new ProductsController();
