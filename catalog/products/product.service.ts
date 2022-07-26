import { injectable } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Product } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { ProductQueryDTO } from '../catalog.dtos';
import { PaginationDTO } from '../../core/lib/dto';

@injectable()
export class ProductService {
  private productRepository: Repository<Product>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
  }

  async getProducts(queryParams: ProductQueryDTO): Promise<PaginationDTO<Product>> {
    const {
      name,
      minPrice,
      maxPrice,
      desc,
      available,
      colors,
      categories,
      brands,
      tags,
      sortBy = 'name',
      orderBy = 'DESC',
      offset = 0,
      limit = 10,
    } = queryParams;
    const queryBuilder = await this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.colors', 'color')
      .leftJoinAndSelect('product.tags', 'tag');

    if (name) { queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` }); }
    if (minPrice) { queryBuilder.andWhere('product.price >= :minPrice', { minPrice: minPrice }); }
    if (maxPrice) { queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: maxPrice }); }
    if (desc) { queryBuilder.andWhere('product.desc LIKE :desc', { desc: `%${desc}%` }); }
    if (available) { queryBuilder.andWhere('product.available EQUAL :available', { available: `%${available}%` }); }
    if (colors) { queryBuilder.andWhere('color.url IN (:...colors)', { colors: colors }); }
    if (categories) { queryBuilder.andWhere('category.url IN (:...categories)', { categories: categories }); }
    if (brands) { queryBuilder.andWhere('brand.url IN (:...brands)', { brands: brands }); }
    if (tags) { queryBuilder.andWhere('tag.url IN (:...tags)', { tags: JSON.parse(tags) }); }

    const products = await queryBuilder
      .orderBy(`product.${sortBy}`, orderBy)
      .skip(offset)
      .take(limit)
      .getMany();

    return {
      rows: products,
      length: await this.productRepository.count()
    }
  }

  async getProductsPriceRange(queryParams: ProductQueryDTO): Promise<{ minPrice: number, maxPrice: number } | undefined> {
    const {
      name,
      categories,
    } = queryParams;
    const queryBuilder = await this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")

    if (name) { queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` }); }
    if (categories) { queryBuilder.andWhere('category.url IN (:...categories)', { categories: categories }); }

    return queryBuilder
      .select('MIN(product.price)', 'minPrice')
      .addSelect('MAX(product.price)', 'maxPrice')
      .getRawOne();
  }

  async getProduct(id: string): Promise<Product> {
    const queryBuilder = await this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.colors', 'color')
      .leftJoinAndSelect('product.tags', 'tag')
      .where('product.id = :id', { id: id })
      .getOne();

    if (!queryBuilder) { throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND) }

    return queryBuilder
  }

  async createProduct(newProduct: Product): Promise<Product> {
    return this.productRepository.save(newProduct);
  }

  async updateProduct(id: string, productDTO: Product) {
    const product = await this.productRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    return this.productRepository.save({
      ...product,
      ...productDTO,
    });
  }

  async removeProduct(id: string) {
    const product = await this.productRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    return this.productRepository.remove(product);
  }
}
