import { Role } from '../core/enums/roles.enum';
import { Comment, Review } from '../core/entities';

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
  text: string,
  createdAt: Date,
  updatedAt: Date,
  showOnMain: boolean,
  product: ProductDTO | string,
  user: UserDTO | string,
  comments: Comment[],
}

export interface ReviewQueryDTO {
  id?: string,
  productId?: string,
  userId?: string,
  showOnMain?: boolean,
  sortBy?: 'productId' | 'userId',
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
  offset?: number;
  merge?: string;
}

export interface CommentQueryDTO {
  id?: string,
  userId?: string,
  orderBy?: 'DESC' | 'ASC';
  limit?: number;
  offset?: number;
}

export interface CommentDTO {
  id: string,
  user: UserDTO | string,
  review: Review,
  text: String,
  createdAt: Date,
  updatedAt: Date,
}

export interface CreateCommentDTO {
  userId: string,
  text: string,
  reviewId: string,
}

export interface UserAuth {
  id: string,
  role: Role
}
