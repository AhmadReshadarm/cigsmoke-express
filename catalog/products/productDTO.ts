export interface ProductDTO {
  name?: string,
  minPrice?: number,
  maxPrice?: number,
  desc?: string,
  available?: boolean,
  colors?: string,
  categories?: string,
  brands?: string,
  sortBy?: string,
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
}
