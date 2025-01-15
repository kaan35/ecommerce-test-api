import { ResponseService } from "../../services/response.service.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
  #authService;
  #responseService;

  constructor() {
    this.#authService = new AuthService();
    this.#responseService = new ResponseService();
  }

  async login(req, res) {
    const { email, password } = req.body;
    const result = await this.#authService.login(email, password);
    return this.#responseService.success(res, result);
  }

  async register(req, res) {
    const userData = req.body;
    const result = await this.#authService.register(userData);
    return this.#responseService.success(res, result);
  }

  async logout(req, res) {
    const { userId } = req.body;
    await this.#authService.logout(userId);
    return this.#responseService.success(res, {
      message: "Logged out successfully",
    });
  }
}
