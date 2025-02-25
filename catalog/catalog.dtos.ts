import { Category, Color, Review, Tag } from '../core/entities';
import { RatingDTO } from '../core/lib/dto';
import { IsNotEmpty, IsString } from 'class-validator';

export interface ProductQueryDTO {
  readonly name?: string;
  readonly userHistory?: string[];
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly desc?: string;
  readonly available?: boolean;
  readonly colors?: string | string[];
  readonly color?: string;
  readonly categories?: string | string[];
  readonly parent?: string;
  readonly category?: string;
  readonly brands?: string | string[];
  readonly brand?: string;
  readonly tags?: string | string[];
  readonly tag?: string;
  readonly sizes?: string | string[];
  readonly size?: string;
  readonly sortBy?: string;
  readonly orderBy?: 'DESC' | 'ASC';
  readonly offset?: number;
  readonly limit?: number;
  readonly image?: string;
  readonly parameters?: string[];
}

export interface TagQueryDTO {
  readonly name?: string;
  readonly products?: string;
  readonly url?: string;
  readonly parent?: string;
  readonly children?: string;
  readonly sortBy?: string;
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export class ParameterQueryDTO {
  variantId?: string;
  key?: string;
  value?: string;
  products?: string;
  parent?: string;
  children?: string;
  sortBy?: string;
  orderBy?: 'ASC' | 'DESC';
  offset?: number;
  limit?: number;
}

export interface ColorQueryDTO {
  readonly name?: string;
  readonly products?: string;
  readonly category?: string;
  readonly parent: string;
  readonly url?: string;
  readonly code?: string;
  readonly sortBy?: string;
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export interface ArticalQueryDTO {
  readonly name?: string;
  readonly products?: string;
  readonly category?: string;
  readonly parent: string;
  readonly url?: string;
  readonly sortBy?: string;
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export interface SizeQueryDTO {
  readonly name?: string;
  readonly products?: string;
  readonly parent: string;
  readonly url?: string;
  readonly sortBy?: string;
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export interface CategoryQueryDTO {
  readonly name?: string;
  readonly image?: string;
  readonly url?: string;
  readonly parent?: string;
  readonly children?: string;
  readonly parameters?: string;
  readonly sortBy?: string;
  readonly orderBy?: 'DESC' | 'ASC';
  readonly offset?: number;
  readonly limit?: number;
}

export interface BrandQueryDTO {
  readonly name?: string;
  readonly image?: string;
  readonly parent?: string;
  readonly category?: string;
  readonly showOnMain?: boolean;
  readonly sortBy?: string;
  readonly orderBy?: 'DESC' | 'ASC';
  readonly limit?: number;
  readonly offset?: number;
}

export interface ProductDTO {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly oldPrice?: number;
  readonly desc: string | null;
  readonly available: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly images: string | null;
  readonly url: string;
  readonly category: Category;
  readonly colors?: Color[];
  readonly tags?: Tag[];
  readonly rating: RatingDTO | null;
  readonly reviews: Review[] | null;
}

export class CreateCategoryDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  desc: string;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsString()
  parentId?: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  parent?: Category;
}

export interface ICreateCategoryAnswer {
  categoryId: string;
}
