import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { ProductsController } from "./products.controller.js";

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
    this.#router.get("/", (req, res, next) =>
      this.#controller.getAllProducts(req, res).catch(next),
    );

    this.#router.get("/:id", (req, res, next) =>
      this.#controller.getProductById(req, res).catch(next),
    );

    // Protected routes
    this.#router.use(authMiddleware.authenticate);

    this.#router.post("/", (req, res, next) =>
      this.#controller.createProduct(req, res).catch(next),
    );

    this.#router.put("/:id", (req, res, next) =>
      this.#controller.updateProduct(req, res).catch(next),
    );

    this.#router.delete("/:id", (req, res, next) =>
      this.#controller.deleteProduct(req, res).catch(next),
    );
  }

  get router() {
    return this.#router;
  }
}

export const productsRouter = new ProductsRouter().router;
