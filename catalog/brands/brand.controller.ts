import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { BrandService } from './brand.service';
import { ProductService } from '../products/product.service';

@singleton()
export class BrandController {
  readonly routes = Router();

  constructor(
    private brandService: BrandService,
    private productService: ProductService
  ) {
    this.routes.get('/brands', this.getBrands);
    this.routes.get('/brands/:id', this.getBrand);
    this.routes.get('/getBrandsByCategory/:categoryUrl', this.getBrandsByCategory)
    this.routes.post('/brands', this.createBrand);
    this.routes.put('/brands/:id', this.updateBrand);
    this.routes.delete('/brands/:id', this.removeBrand);
  }

  private getBrands = asyncHandler(async (req: Request, resp: Response) => {
    const brands = await this.brandService.getBrands();

    resp.json(brands);
  });

  private getBrand = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const brand = await this.brandService.getBrand(id);

    resp.json(brand);
  });

  private getBrandsByCategory = asyncHandler(async (req: Request, resp: Response) => {
    const { categoryUrl } = req.params;

    const products = await this.productService.getProductsByCategory(categoryUrl);
    console.log(products)
    const brands =  await this.brandService.getUniqueBrandsFromProducts(products);
    resp.json(brands);
  })

  private createBrand = asyncHandler(async (req: Request, resp: Response) => {
    const created = await this.brandService.createBrand(req.body);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateBrand = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.brandService.updateBrand(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeBrand = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.brandService.removeBrand(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
