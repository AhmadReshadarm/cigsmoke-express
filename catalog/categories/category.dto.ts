import { Parameter } from '../../core/entities/parameter.entity';

export interface CategoryDto {
  readonly name: string,
  readonly url: string,
  readonly parentId?: string,
  readonly parameters?: Parameter[],
}
