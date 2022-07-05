import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { Parameter, Tag } from '../../core/entities';
import { validation } from '../../core/lib/validator';
import { ParameterQueryDTO, TagQueryDTO } from '../catalog.dtos';


@singleton()
export class ParameterService {
  private parameterRepository: Repository<Parameter>;

  constructor(dataSource: DataSource) {
    this.parameterRepository = dataSource.getRepository(Parameter);
  }

  async getParameters(queryParams: ParameterQueryDTO): Promise<Parameter[]> {
    const {
      name,
      categories,
      sortBy='name',
      orderBy='DESC',
      limit=10,
    } = queryParams;

    const queryBuilder = await this.parameterRepository
      .createQueryBuilder('parameter')
      .leftJoinAndSelect('parameter.categories', 'category')

    if (name) { queryBuilder.andWhere('parameter.name LIKE :name', { name: `%${name}%` }); }
    if (categories) { queryBuilder.andWhere('category.url IN (:...categories)', { categories: JSON.parse(categories) }); }

    return queryBuilder
      .orderBy(`parameter.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();
  }

  async getParameter(id: string): Promise<Parameter> {
    const parameter = await this.parameterRepository.findOneOrFail({
      where: {
          id: Equal(id),
      },
    });

    return parameter;
  }

  async getParametersByIds(ids: string[]): Promise<Parameter[]> {

    const parametersPromises = ids?.map(async parameterId => {
      return this.getParameter(parameterId);
    })

    return Promise.all(parametersPromises ?? []);
  }

  async createParameter(parameterDTO: Parameter): Promise<Parameter> {
    const newParameter = await validation(new Parameter(parameterDTO));

    return this.parameterRepository.save(newParameter);
  }

  async updateParameter(id: string, parameterDTO: Parameter) {
    const parameter = await this.parameterRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    return this.parameterRepository.save({
      ...parameter,
      ...parameterDTO
    });
  }

  async removeParameter(id: string) {
    const parameter = await this.parameterRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    return this.parameterRepository.remove(parameter);
  }
}
