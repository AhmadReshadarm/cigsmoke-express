import { singleton } from 'tsyringe';
import { DataSource, Equal, ILike, Like, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Product } from '../../core/entities/product.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { ProductDTO } from './productDTO';

@singleton()
export class ProductService {
  private productRepository: Repository<Product>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
  }

  async getProducts(queryParams: ProductDTO): Promise<Product[]> {
    const {
      name,
      minPrice,
      maxPrice,
      desc,
      available,
      colors,
      categories,
      brands,
      sortBy='name',
      orderBy='DESC',
      limit=10,
    } = queryParams;
    const queryBuilder = this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.colors', 'color');

    if (name) { queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` }); }
    if (minPrice) { queryBuilder.andWhere('product.price >= :minPrice', { minPrice: minPrice }); }
    if (maxPrice) { queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: maxPrice }); }
    if (desc) { queryBuilder.andWhere('product.desc LIKE :desc', { desc: `%${desc}%` }); }
    if (available) { queryBuilder.andWhere('product.available EQUAL :available', { available: `%${available}%` }); }
    if (colors) { queryBuilder.andWhere('color.url IN (:...colors)', { colors: JSON.parse(colors) })}
    if (categories) { queryBuilder.andWhere('category.url IN (:...categories)', { categories: JSON.parse(categories) }); }
    if (brands) { queryBuilder.andWhere('brand.name IN (:...brands)', { brands: JSON.parse(brands) }); }

    return queryBuilder
      .orderBy(`product.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();
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
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect('product.brand', 'brand')
      .where("category.url = :categoryUrl", { categoryUrl })
      .orderBy('product.name', 'DESC')
      .getMany();
  }

  async getProductsByName(productName: string, categoryUrl: string): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect('product.brand', 'brand')
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
