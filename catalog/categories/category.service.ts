import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository, TreeRepository } from 'typeorm';
import { Category } from '../../core/entities';
import { CategoryDTO, CategoryQueryDTO } from '../catalog.dtos';


@singleton()
export class CategoryService {
  private categoryRepository: Repository<Category>;
  private categoryTreeRepository: TreeRepository<Category>;

  constructor(dataSource: DataSource) {
    this.categoryRepository = dataSource.getRepository(Category);
    this.categoryTreeRepository = dataSource.getTreeRepository(Category);
  }

  async getCategories(queryParams: CategoryQueryDTO): Promise<Category[]> {
    const {
      name,
      url,
      parameters,
      parent,
      children,
      sortBy='name',
      orderBy='DESC',
      limit=10,
    } = queryParams;

    const queryBuilder = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parameters', 'parameter')
      .leftJoinAndSelect('category.children', 'categoryChildren')
      .leftJoinAndSelect('category.parent', 'categoryParent')

    if (name) { queryBuilder.andWhere('category.name LIKE :name', { name: `%${name}%` }); }
    if (url) { queryBuilder.andWhere('category.url LIKE :url', { url: `%${url}%` }); }
    if (parameters) { queryBuilder.andWhere('parameter.name IN (:...parameters)', { parameters: JSON.parse(parameters) }); }
    if (parent) { queryBuilder.andWhere('categoryParent.id = :parent', { parent: parent }) }
    if (children) { queryBuilder.andWhere('categoryChildren.id IN (:...children)', { children: JSON.parse(children) }); }


    return queryBuilder
      .orderBy(`category.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();
  }

  async getCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneOrFail({
      where: {
          id: Equal(id),
      },
      relations: ['parent', 'children'],
    });

    return category;
  }

  async getCategoriesTree(): Promise<Category[]> {
    return await this.categoryTreeRepository.findTrees()
  }

  async createCategory(categoryDTO: CategoryDTO): Promise<Category> {
      return this.categoryRepository.save(categoryDTO);
  }

  async updateCategory(id: string, categoryDTO: Category) {
    const category = await this.categoryRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    return this.categoryRepository.save( {
      ...category,
      ...categoryDTO
    });
  }

  async removeCategory(id: string) {
    const category = await this.categoryRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    return this.categoryRepository.remove(category);
  }
}
