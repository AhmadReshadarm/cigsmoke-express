export interface UserDTO {
  id: string,
  firstName: string,
  lastName: string,
  email: string,
}

export interface ProductDTO {
  name: string,
  price: number,
  desc?: string,
  available: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export interface WishlistDTO {
  id: string,
  product: ProductDTO | undefined,
  user:  UserDTO | undefined,
}

export interface WishlistQueryDTO {
  id?: string,
  productId?: string,
  userId?: string,
  sortBy?: 'productId' | 'userId',
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
}