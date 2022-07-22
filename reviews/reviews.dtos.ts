import { Role } from '../core/enums/roles.enum';

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

export interface ReviewDTO {
  id: string,
  rating: number,
  comment: string,
  createdAt: Date,
  updatedAt: Date,
  product: ProductDTO | string,
  user: UserDTO | string,
}

export interface ReviewQueryDTO {
  id?: string,
  productId?: string,
  userId?: string,
  sortBy?: 'productId' | 'userId',
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
}

export interface UserAuth {
  id: string,
  role: Role
}
