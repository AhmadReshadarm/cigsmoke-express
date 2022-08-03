import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository, TreeRepository } from 'typeorm';
import { Category, Parameter } from '../../core/entities';
import { CategoryQueryDTO, CreateCategoryDTO, CreateParameterDTO, ICreateCategoryAnswer } from '../catalog.dtos';
import { PaginationDTO } from '../../core/lib/dto';
import { validation } from '../../core/lib/validator';


@singleton()
export class CategoryService {
  private categoryRepository: Repository<Category>;
  private categoryTreeRepository: TreeRepository<Category>;
  private parametersRepository: Repository<Parameter>;

  constructor(dataSource: DataSource) {
    this.categoryRepository = dataSource.getRepository(Category);
    this.categoryTreeRepository = dataSource.getTreeRepository(Category);
    this.parametersRepository = dataSource.getRepository(Parameter)
  }

  async getCategories(queryParams: CategoryQueryDTO): Promise<PaginationDTO<Category>> {
    const {
      name,
      url,
      parameters,
      parent,
      children,
      sortBy='name',
      orderBy='DESC',
      offset=0,
      limit=10,
    } = queryParams;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.parameters', 'parameter')
      .leftJoinAndSelect('category.children', 'categoryChildren')
      .leftJoinAndSelect('category.parent', 'categoryParent')

    if (name) { queryBuilder.andWhere('category.name LIKE :name', { name: `%${name}%` }); }
    if (url) { queryBuilder.andWhere('category.url LIKE :url', { url: `%${url}%` }); }
    if (parameters) { queryBuilder.andWhere('parameter.name IN (:...parameters)', { parameters: JSON.parse(parameters) }); }
    if (parent) { queryBuilder.andWhere('categoryParent.id = :parent', { parent: parent }) }
    if (children) { queryBuilder.andWhere('categoryChildren.id IN (:...children)', { children: JSON.parse(children) }); }

    queryBuilder
      .orderBy(`category.${sortBy}`, orderBy)
      .skip(offset)
      .take(limit);

    return {
      rows: await queryBuilder.getMany(),
      length: await queryBuilder.getCount(),
    }
  }

  async getCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneOrFail({
      where: {
          id: Equal(id),
      },
      relations: ['parent', 'children', 'parameters'],
    });

    return category;
  }

  async getCategoriesTree(): Promise<Category[]> {
    return await this.categoryTreeRepository.findTrees()
  }

  async createParameters(parameters: CreateParameterDTO[]): Promise<string[]> {
    const ids = parameters.map(async (parameter) => {
      const created = await this.parametersRepository.save(parameter)
      return created.id
    })

    return Promise.all(ids);
  }

  async createCategory(categoryDTO: CreateCategoryDTO): Promise<ICreateCategoryAnswer> {
    const { parameters } = categoryDTO
    if (parameters) {
      await validation(parameters)
    }

    const created = await this.categoryRepository.save(categoryDTO);

    if (parameters) {
      parameters.forEach((parameter) => {
        parameter.category = created
      })
    }

    const parametersIds = parameters ? await this.createParameters(parameters) : null;

    return {
      categoryId: created.id,
      parametersIds: parametersIds
    }
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
