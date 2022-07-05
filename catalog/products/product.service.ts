import { injectable } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Product } from '../../core/entities/catalog/product.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { ProductQueryDTO } from '../catalog.dtos';

@injectable()
export class ProductService {
  private productRepository: Repository<Product>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
  }

  async getProducts(queryParams: ProductQueryDTO): Promise<Product[]> {
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
      sortBy='name',
      orderBy='DESC',
      limit=10,
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
    if (colors) { queryBuilder.andWhere('color.url IN (:...colors)', { colors: JSON.parse(colors) }); }
    if (categories) { queryBuilder.andWhere('category.url IN (:...categories)', { categories: JSON.parse(categories) }); }
    if (brands) { queryBuilder.andWhere('brand.name IN (:...brands)', { brands: JSON.parse(brands) }); }
    if (tags) { queryBuilder.andWhere('tag.url IN (:...tags)', { tags: JSON.parse(tags) }); }

    return queryBuilder
      .orderBy(`product.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();
  }

  async getProduct(id: string): Promise<Product> {
    const queryBuilder = await this.productRepository.createQueryBuilder("product")
      .leftJoinAndSelect("product.category", "category")
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.colors', 'color')
      .leftJoinAndSelect('product.tags', 'tag')
      .where('product.id = :id', {id: id})
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
