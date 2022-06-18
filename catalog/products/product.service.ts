import { singleton } from 'tsyringe';
import { DataSource, Equal, ILike, Like, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Product } from '../../core/entities/product.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { ProductDto } from './product.dto';

@singleton()
export class ProductService {
  private productRepository: Repository<Product>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
  }

  async getProducts(queryParams: ProductDto): Promise<Product[]> {
    const {
      name,
      price,
      desc,
      available,
      colors,
      category,
      brand,
      sortBy='name',
      orderBy='DESC'
    } = queryParams;
    const queryBuilder = this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect('product.brand', 'brand');

    if (name) { queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` }); }
    if (price) { queryBuilder.andWhere('product.price = :price', { price: price }); }
    if (desc) { queryBuilder.andWhere('product.desc LIKE :desc', { desc: `%${desc}%` }); }
    if (available) { queryBuilder.andWhere('product.available EQUAL :available', { available: `%${available}%` }); }
    if (colors) { queryBuilder.andWhere('product.colors LIKE :colors', { colors: `%${colors}%` }); }
    if (category) { queryBuilder.andWhere('category.url LIKE :category', { category: `%${category}%` }); }
    if (brand) { queryBuilder.andWhere('brand.name LIKE :brand', { brand: `%${brand}%` }); }

    return queryBuilder.orderBy(`product.${sortBy}`, orderBy).getMany();
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
