/**
 * @fileoverview Authentication routes
 */
import { Router } from "express";
import { AuthController } from "./auth.controller.js";

export class AuthRouter {
  #router;
  #controller;

  constructor() {
    this.#router = Router();
    this.#controller = new AuthController();
    this.#setupRoutes();
  }

  #setupRoutes() {
    this.#router.post("/login", (req, res, next) =>
      this.#controller.login(req, res).catch(next),
    );

    this.#router.post("/register", (req, res, next) =>
      this.#controller.register(req, res).catch(next),
    );

    this.#router.post("/logout", (req, res, next) =>
      this.#controller.logout(req, res).catch(next),
    );
  }

  get router() {
    return this.#router;
  }
}

// Export a singleton instance
export const authRouter = new AuthRouter().router;
