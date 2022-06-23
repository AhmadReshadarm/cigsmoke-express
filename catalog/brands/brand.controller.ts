import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { HttpStatus } from '../../core/lib/http-status';
import { BrandService } from './brand.service';
import { ProductService } from '../products/product.service';
import { Controller, Delete, Get, Post, Put } from '../../core/decorators';

@singleton()
@Controller('/brands')
export class BrandController {
  constructor(
    private brandService: BrandService,
    private productService: ProductService
  ) {}

  @Get()
  async getBrands(req: Request, resp: Response) {
    const brands = await this.brandService.getBrands();

    resp.json(brands);
  };

  @Get(':id')
  async getBrand(req: Request, resp: Response) {
    const { id } = req.params;
    const brand = await this.brandService.getBrand(id);

    resp.json(brand);
  };

  @Get('getBrandsByCategory/:categoryUrl')
  async getBrandsByCategory(req: Request, resp: Response) {
    const { categoryUrl } = req.params;

    const products = await this.productService.getProductsByCategory(categoryUrl);
    console.log(products)
    const brands =  await this.brandService.getUniqueBrandsFromProducts(products);
    resp.json(brands);
  }

  @Post('')
  async createBrand(req: Request, resp: Response) {
    const created = await this.brandService.createBrand(req.body);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  };

  @Put(':id')
  async updateBrand(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.brandService.updateBrand(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  };

  @Delete(':id')
  async removeBrand(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.brandService.removeBrand(id);

    resp.status(HttpStatus.OK).json(removed);
  };
}
