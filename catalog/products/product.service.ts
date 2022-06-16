import { singleton } from 'tsyringe';
import { DataSource, Equal, ILike, Like, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Product } from '../../core/entities/product.entity';
import { HttpStatus } from '../../core/lib/http-status';


@singleton()
export class ProductService {
  private productRepository: Repository<Product>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
  }

  async getProducts(): Promise<Product[]> {
    return await this.productRepository.find({relations: ['category', 'brand']});
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOneOrFail({
        where: {
            id: Equal(id),
        },
        relations: ['category', 'brand'],
    });
      return product;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getProductsByCategory(categoryUrl: string) {
    return this.productRepository.createQueryBuilder("product")
      .innerJoinAndSelect("product.category", "category")
      .innerJoinAndSelect('product.brand', 'brand')
      .where("category.url = :categoryUrl", { categoryUrl })
      .orderBy('product.name', 'DESC')
      .getMany();
  }

  async getProductsByName(productName: string, categoryUrl: string): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder("product")
      .innerJoinAndSelect("product.category", "category")
      .innerJoinAndSelect('product.brand', 'brand')
      .where('product.name LIKE :productName', { productName: `%${productName}%` });
    if (categoryUrl) {
      queryBuilder.andWhere("category.url = :categoryUrl", { categoryUrl })
    }

    return queryBuilder.orderBy('product.name', 'DESC').getMany();
  }

  async createProduct(newProduct: Product): Promise<Product> {
    return this.productRepository.save(newProduct);
  }

  async updateProduct(id: string, productDTO: Product) {
    try {
      const product = await this.productRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });

      return this.productRepository.save({
        ...product,
        ...productDTO,
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeProduct(id: string) {
    try {
      await this.productRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.productRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
