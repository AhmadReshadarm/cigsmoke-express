import { injectable } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { ProductParameter } from '../../core/entities';
import { ParameterQueryDTO } from '../catalog.dtos';
import { PaginationDTO } from '../../core/lib/dto';

@injectable()
export class ParameterService {
  private parameterRepository: Repository<ProductParameter>;

  constructor(dataSource: DataSource) {
    this.parameterRepository = dataSource.getRepository(ProductParameter);
  }

  async getParameters(queryParams: ParameterQueryDTO): Promise<PaginationDTO<ProductParameter>> {
    const {
      key,
      value,
      variantId,
      products,
      parent,
      children,
      sortBy = 'key',
      orderBy = 'DESC',
      offset = 0,
      limit = 10,
    } = queryParams;

    const queryBuilder = this.parameterRepository
      .createQueryBuilder('parameter')
      .leftJoinAndSelect('parameter.variant', 'productVariant')
      .leftJoinAndSelect('productVariant.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent');

    if (variantId) {
      queryBuilder.andWhere('parameter.variantId = :variantId', { variantId });
    }
    if (key) {
      const keywords = key.toLowerCase().split(/\s+/);
      let query = queryBuilder;
      keywords.forEach(keyword => {
        query = query.where(`LOWER(parameter.key) LIKE :keyword`, { keyword: `%${keyword}%` });
      });
    }
    if (value) {
      queryBuilder.andWhere('parameter.value = :value', { value });
    }
    if (products) {
      queryBuilder.andWhere('product.url IN (:...products)', { products: JSON.parse(products) });
    }
    if (parent) {
      queryBuilder.andWhere('categoryParent.url = :parent', { parent: `${parent}` });
    }
    if (children) {
      queryBuilder.andWhere('category.url = :children', { children: `${children}` });
    }

    queryBuilder.orderBy(`parameter.${sortBy}`, orderBy).skip(offset).take(limit);

    return {
      rows: await queryBuilder.getMany(),
      length: await queryBuilder.getCount(),
    };
  }

  async getParameter(id: string): Promise<ProductParameter> {
    return this.parameterRepository.findOneOrFail({
      where: { id: Equal(id) },
    });
  }

  async createParameter(parameter: ProductParameter): Promise<ProductParameter> {
    return this.parameterRepository.save(parameter);
  }

  async updateParameter(id: string, parameter: ProductParameter): Promise<ProductParameter> {
    await this.parameterRepository.update(id, parameter);
    return this.getParameter(id);
  }

  async removeParameter(id: string): Promise<void> {
    await this.parameterRepository.delete(id);
  }
}
