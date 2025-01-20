import { Router } from 'express';
import { ProductsController } from './products.controller.ts';

export class ProductsRouter {
  #router;
  #controller;

  constructor() {
    this.#router = Router();
    this.#controller = new ProductsController();
    this.#setupRoutes();
  }

  #setupRoutes() {
    // Public routes
    this.#router.get('/', (req, res) => this.#controller.getAllProducts(req, res));
    this.#router.get('/:id', (req, res) => this.#controller.getProductById(req, res));

    // Protected routes
    this.#router.post('/', (req, res) => this.#controller.createProduct(req, res));
    this.#router.put('/:id', (req, res) => this.#controller.updateProduct(req, res));
    this.#router.delete('/:id', (req, res) => this.#controller.deleteProduct(req, res));
  }

  get router() {
    return this.#router;
  }
}

export const productsRouter = new ProductsRouter().router;
