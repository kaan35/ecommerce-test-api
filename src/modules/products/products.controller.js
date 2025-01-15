import { ResponseService } from "../../services/response.service.js";
import { ProductsService } from "./products.service.js";

export class ProductsController {
  #productsService;
  #responseService;

  constructor() {
    this.#productsService = new ProductsService();
    this.#responseService = new ResponseService();
  }

  async getAllProducts(req, res) {
    const { page = 1, limit = 10, sort, filter } = req.query;
    const products = await this.#productsService.find({
      page: Number(page),
      limit: Number(limit),
      sort,
      filter,
    });

    return this.#responseService.success(res, products);
  }

  async getProductById(req, res) {
    const { id } = req.params;
    const product = await this.#productsService.findById(id);

    if (!product) {
      return this.#responseService.notFound(res, "Product not found");
    }

    return this.#responseService.success(res, product);
  }

  async createProduct(req, res) {
    const productData = req.body;
    const product = await this.#productsService.create(productData);

    return this.#responseService.created(res, product);
  }

  async updateProduct(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    const product = await this.#productsService.update(id, updateData);

    if (!product) {
      return this.#responseService.notFound(res, "Product not found");
    }

    return this.#responseService.success(res, product);
  }

  async deleteProduct(req, res) {
    const { id } = req.params;
    const deleted = await this.#productsService.delete(id);

    if (!deleted) {
      return this.#responseService.notFound(res, "Product not found");
    }

    return this.#responseService.success(
      res,
      null,
      "Product deleted successfully",
    );
  }
}

// Export singleton instance
export const productsController = new ProductsController();
