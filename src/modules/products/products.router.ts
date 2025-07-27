import { ProductsController } from './products.controller.ts';
import { Router } from 'express';

export class ProductsRouter {
  readonly #router: Router;
  readonly #controller: ProductsController;

  constructor() {
    this.#router = Router();
    this.#controller = new ProductsController();
    this.#setupRoutes();
  }

  #setupRoutes(): void {
    // Public routes
    this.#router
      .get('/', this.#controller.getAll)
      .get('/:id', this.#controller.getById)
      // Protected routes
      .post('/', this.#controller.create)
      .put('/:id', this.#controller.update)
      .delete('/:id', this.#controller.delete);
  }

  get router(): Router {
    return this.#router;
  }
}

export const productsRouter = new ProductsRouter().router;
