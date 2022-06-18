import { Brand, Category, Color } from '../../core/entities';

export interface ProductDto {
  name?: string,
  price?: number,
  desc?: string,
  available?: boolean,
  colors?: Color[],
  category?: Category,
  brand?: Brand,
  sortBy?: string,
  orderBy?: 'DESC' | 'ASC';
}
