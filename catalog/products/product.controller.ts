import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { ProductService } from './product.service';
import { Product } from '../../core/entities/catalog/product.entity';
import { ColorService } from '../colors/color.service';
import { Color } from '../../core/entities';
import { Controller, Delete, Get, Post, Put } from '../../core/decorators';

@injectable()
@Controller('/products')
export class ProductController {
  constructor(
    private productService: ProductService,
    private colorService: ColorService
  ) {}
  
  @Get()
  async getProducts(req: Request, resp: Response) {
    const products = await this.productService.getProducts(req.query);
    
    resp.json(products);
  };

  @Get(':id')
  async getProduct (req: Request, resp: Response) {
    const { id } = req.params;
    const product = await this.productService.getProduct(id);

    resp.json(product);
  };

  @Get('productsByCategory/:categoryUrl')
  async getProductsByCategory(req: Request, resp: Response) {
    const { categoryUrl } = req.params;
    const products = await this.productService.getProductsByCategory(categoryUrl);

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
  }

  @Get('productsByName/:productName/:categoryUrl')
  async getProductsByName(req: Request, resp: Response) {
    const { productName, categoryUrl } = req.params;

    const products = await this.productService.getProductsByName(productName, categoryUrl);
    resp.json(products);
  };

  @Get('productsUnderOneThousand')
  async getProductsUnderOneThousand(req: Request, resp: Response) {
    const products = await this.productService.getProducts({minPrice: 1000});

    resp.json(products);
  }

  @Post()
  async createProduct(req: Request, resp: Response) {
    const { colors } = req.body;
    const newProduct = await validation(new Product(req.body));

    console.log(newProduct);

    colors ? newProduct.colors = await this.colorService.getColorsByIds(colors.map((color: Color) => String(color))) : null;
    const created = await this.productService.createProduct(newProduct);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  };

  @Put(':id')
  async updateProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const { colors } = req.body;
    const newProduct = await validation(new Product(req.body));

    colors ? newProduct.colors = await this.colorService.getColorsByIds(colors.map((color: Color) => String(color))) : null;
    const updated = await this.productService.updateProduct(id, newProduct);

    resp.status(HttpStatus.OK).json(updated);
  };

  @Delete(':id')
  async removeProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.productService.removeProduct(id);

    resp.status(HttpStatus.OK).json(removed);
  };
}
