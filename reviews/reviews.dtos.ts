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
  product: ProductDTO | undefined,
  user:  UserDTO | undefined,
}
