import { Address, Basket, Checkout, OrderProduct, PaymentCard } from '../core/entities';
import { Role } from '../core/enums/roles.enum';
import { BasketStatus } from '../core/enums/basket-status.enum';

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
  id: string,
  // user: UserDTO | string,
  product: ProductDTO | undefined,
  inBasket: Basket
  qty: number,
  productPrice: number,
}

export interface OrderProductQueryDTO {
  userId?: string,
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
  id: string,
  userId: string | null,
  orderProducts: OrderProductDTO[],
  checkout: Checkout,
  totalAmount: number,
  createdAt: Date,
  updatedAt: Date,
  status: BasketStatus;
}

export interface BasketQueryDTO {
  minTotalAmount?: number,
  maxTotalAmount?: number,
  updatedFrom?: Date,
  updatedTo?: Date,
  userId?: string,
  status?: BasketStatus
  sortBy?: 'productId' | 'qty' | 'price',
  orderBy?: 'DESC' | 'ASC',
  limit?: number,
}

export interface AddressDTO {
  id: string
  user: UserDTO | string,
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


export interface CheckoutDTO {
  id: string;
  user: UserDTO | string;
  address: Address,
  payment: PaymentCard,
  basket: Basket,
  comment: string
}

export interface CheckoutQueryDTO {
  id?: string
  userId?: string,
  addressId?: string,
  paymentId?: string,
  basketId?: string
  sortBy?: string,
  orderBy?: 'DESC' | 'ASC',
  limit?: number,
}

export interface UserAuth {
  id: string,
  role: Role
}
