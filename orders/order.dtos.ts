import { Basket, Checkout, OrderProduct } from '../core/entities';

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

export interface OrderProductDTO {
  id: string
  product: ProductDTO | undefined,
  inBasket: Basket
  qty: number,
  productPrice: number,
}

export interface OrderProductQueryDTO {
  minQty?: number,
  maxQty?: number,
  minPrice?: number,
  maxPrice?: number,
  productId?: string,
  sortBy?: 'productId' | 'qty' | 'price',
  orderBy?: 'DESC' | 'ASC',
  limit?: number,
}

export interface BasketDTO {
  id: string
  user: UserDTO | undefined,
  orderProducts: OrderProduct[],
  checkout: Checkout,
  totalAmount: number,
  createdAt: Date,
  updatedAt: Date,
}

export interface BasketQueryDTO {
  minTotalAmount?: number,
  maxTotalAmount?: number,
  userId?: string,
  sortBy?: 'productId' | 'qty' | 'price',
  orderBy?: 'DESC' | 'ASC',
  limit?: number,
}

export interface AddressDTO {
  id: string
  user: UserDTO | undefined,
  fistName: string,
  lastName: string
  address: string,
  city: string,
  country: string,
  zipCode: string,
  checkouts: Checkout[],
}

export interface AddressQueryDTO {
  id?: string
  userId?: string,
  firstName?: string,
  lastName?: string
  address?: string,
  city?: string,
  country?: string,
  zipCode?: string,
  sortBy?: string,
  orderBy?: 'DESC' | 'ASC',
  limit?: number,
}

export interface CheckoutQueryDTO {
  id?: string
  addressId?: string,
  paymentId?: string,
  basketId?: string
  sortBy?: string,
  orderBy?: 'DESC' | 'ASC',
  limit?: number,
}
