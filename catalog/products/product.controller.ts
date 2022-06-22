import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { ProductService } from './product.service';
import { ColorService } from '../colors/color.service';
import { Color, Product } from '../../core/entities';
import { TagService } from '../tags/tag.service';


@singleton()
export class ProductController {
  readonly routes = Router();

  constructor(
    private productService: ProductService,
    private colorService: ColorService,
    private tagService: TagService,
  ) {
    this.routes.get('/products', this.getProducts);
    this.routes.get('/products/:id', this.getProduct);
    this.routes.get('/productsUnderOneThousand', this.getProductsUnderOneThousand)
    this.routes.post('/products', this.createProduct);
    this.routes.put('/products/:id', this.updateProduct);
    this.routes.delete('/products/:id', this.removeProduct);
  }

  private getProducts = asyncHandler(async (req: Request, resp: Response) => {
    const products = await this.productService.getProducts(req.query);

    resp.json(products);
  });

  private getProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const product = await this.productService.getProduct(id);

    resp.json(product);
  });

  private getProductsUnderOneThousand = asyncHandler(async (req: Request, resp: Response) => {
    const products = await this.productService.getProducts({ tags: JSON.stringify(['underOneThousand']) });

    resp.json(products);
  })

  private createProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { colors, tags } = req.body;
    const newProduct = await validation(new Product(req.body));

    colors ? newProduct.colors = await this.colorService.getColorsByIds(colors.map((color: Color) => String(color))) : null;
    tags ? newProduct.tags = await this.tagService.getTagsByIds(tags.map((tag: Color) => String(tag))) : null;

    const created = await this.productService.createProduct(newProduct);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const { colors, tags } = req.body;
    const newProduct = await validation(new Product(req.body));

    colors ? newProduct.colors = await this.colorService.getColorsByIds(colors.map((color: Color) => String(color))) : null;
    tags ? newProduct.tags = await this.tagService.getTagsByIds(tags.map((tag: Color) => String(tag))) : null;
    const updated = await this.productService.updateProduct(id, newProduct);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.productService.removeProduct(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
