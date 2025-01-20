import { responseService } from '../../services/response.service.js';
import { productsService } from './products.service.js';

export class ProductsController {
  async getAllProducts(req, res) {
    const { page = 1, limit = 10, sort, filter } = req.query;
    const products = await productsService.find({
      page: Number(page),
      limit: Number(limit),
      sort,
      filter,
    });

    return responseService.success(res, products);
  }

  async getProductById(req, res) {
    const { id } = req.params;
    const product = await productsService.findOne(id);

    if (!product) {
      return responseService.notFound(res, 'Product not found');
    }

    return responseService.success(res, product);
  }

  async createProduct(req, res) {
    const productData = req.body;
    const product = await productsService.create(productData);

    return responseService.created(res, product);
  }

  async updateProduct(req, res) {
    const { id } = req.params;
    const updateData = req.body;

    const product = await productsService.update(id, updateData);

    if (!product) {
      return responseService.notFound(res, 'Product not found');
    }

    return responseService.success(res, product);
  }

  async deleteProduct(req, res) {
    const { id } = req.params;
    const deleted = await productsService.delete(id);

    if (!deleted) {
      return responseService.notFound(res, 'Product not found');
    }

    return responseService.success(res, null, 'Product deleted successfully');
  }
}

// Export singleton instance
export const productsController = new ProductsController();
