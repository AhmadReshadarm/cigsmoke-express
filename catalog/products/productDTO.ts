export interface ProductDTO {
  name?: string,
  minPrice?: number,
  maxPrice?: number,
  desc?: string,
  available?: boolean,
  colors?: string,
  categories?: string,
  brands?: string,
  tags?: string,
  sortBy?: string,
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
}
