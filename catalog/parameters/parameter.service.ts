import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Parameter } from '../../core/entities/catalog/parameter.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';


@singleton()
export class ParameterService {
  private parameterRepository: Repository<Parameter>;

  constructor(dataSource: DataSource) {
    this.parameterRepository = dataSource.getRepository(Parameter);
  }

  async getParameters(): Promise<Parameter[]> {
    return await this.parameterRepository.find();
  }

  async getParameter(id: string): Promise<Parameter> {
    try {
      const parameter = await this.parameterRepository.findOneOrFail({
        where: {
            id: Equal(id),
        },
      });
      return parameter;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
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
    try {
      const parameter = await this.parameterRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.parameterRepository.save({
        ...parameter,
        ...parameterDTO
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeParameter(id: string) {
    try {
      await this.parameterRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.parameterRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
