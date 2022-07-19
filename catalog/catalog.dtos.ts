import { Parameter } from '../core/entities';

export interface ProductQueryDTO {
  readonly name?: string,
  readonly minPrice?: number,
  readonly maxPrice?: number,
  readonly desc?: string,
  readonly available?: boolean,
  readonly colors?: string,
  readonly categories?: string,
  readonly brands?: string,
  readonly tags?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
}

export interface TagQueryDTO {
  readonly name?: string,
  readonly products?: string,
  readonly url?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
}

export interface ParameterQueryDTO {
  readonly name?: string,
  readonly categories?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
}

export interface ColorQueryDTO {
  readonly name?: string,
  readonly products?: string,
  readonly url?: string,
  readonly code?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
}

export interface CategoryDTO {
  readonly name: string,
  readonly url: string,
  readonly parentId?: string,
  readonly parameters?: Parameter[],
}

export interface CategoryQueryDTO {
  readonly name?: string,
  readonly url?: string,
  readonly parent?: string,
  readonly children?: string,
  readonly parameters?: string,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
}

export interface BrandQueryDTO {
  readonly name?: string,
  readonly image?: string,
  readonly showOnMain?: boolean,
  readonly sortBy?: string,
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
}
