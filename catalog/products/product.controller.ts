import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { ProductService } from './product.service';
import { Product } from '../../core/entities/product.entity';
import { ColorService } from '../colors/color.service';
import { Color } from '../../core/entities';


@singleton()
export class ProductController {
  readonly routes = Router();

  constructor(
    private productService: ProductService,
    private colorService: ColorService
  ) {
    this.routes.get('/products', this.getProducts);
    this.routes.get('/products/:id', this.getProduct);
    this.routes.get('/productsByName/:productName', this.getProductsByName);
    this.routes.get('/productsByName/:productName/:categoryUrl', this.getProductsByName);
    this.routes.get('/productsByCategory/:categoryUrl', this.getProductsByCategory);
    this.routes.post('/products', this.createProduct);
    this.routes.put('/products/:id', this.updateProduct);
    this.routes.delete('/products/:id', this.removeProduct);
  }

  private getProducts = asyncHandler(async (req: Request, resp: Response) => {
    const products = await this.productService.getProducts();

    resp.json(products);
  });

  private getProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProduct(id);

    resp.json(product);
  });

  private getProductsByCategory = asyncHandler(async (req: Request, resp: Response) => {
    const { categoryUrl } = req.params;
    const products = await this.productService.getProductsByCategory(categoryUrl);
    console.log(products);

    resp.status(HttpStatus.OK).json(products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      desc: product.desc,
      available: product.available,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      url: product.url,
    })));
  })

  private getProductsByName = asyncHandler(async (req: Request, resp: Response) => {
    const { productName, categoryUrl } = req.params;

    const products = await this.productService.getProductsByName(productName, categoryUrl);
    resp.json(products);
  });

  private createProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { colors } = req.body;
    const newProduct = await validation(new Product(req.body));

    colors ? newProduct.colors = await this.colorService.getColorsByIds(colors.map((color: Color) => String(color))) : null;
    const created = await this.productService.createProduct(newProduct);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const { colors } = req.body;
    const newProduct = await validation(new Product(req.body));

    colors ? newProduct.colors = await this.colorService.getColorsByIds(colors.map((color: Color) => String(color))) : null;
    const updated = await this.productService.updateProduct(id, newProduct);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.productService.removeProduct(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
