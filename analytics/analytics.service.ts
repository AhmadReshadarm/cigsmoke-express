import { singleton } from 'tsyringe';
import axios from 'axios';
import { Brand, Category, OrderProduct, Product, Review, User } from '../core/entities';
import {
  AnalyticsData,
  AnalyticsDTO,
  BasketDTO,
  DynamicDTO,
  DynamicQueryDTO,
  OrderProductDTO, RatingQueryParams,
  SalesQueryDTO, UnregisteredUser, UsersQueryDTO,
} from './analytics.dtos';
import { GroupBy, Steps } from '../core/enums/analytics.enum';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { HttpStatus } from '../core/lib/http-status';
import { BasketStatus } from '../core/enums/basket-status.enum';

@singleton()
export class AnalyticsService {

  async getAnalyticsData(
    params: SalesQueryDTO,
    basket: BasketDTO,
    orderProduct: OrderProductDTO,
    authToken: string
  ): Promise<User | Brand | Category | Product | UnregisteredUser> {
    if (params.groupBy?.toLowerCase() === GroupBy.User) {
      if (basket.userId !== "null") {
        return this.getUser(basket.userId!, authToken);
      }
      return {
        id: "UnregisteredUsers",
      }
    }
    if (params.groupBy?.toLowerCase() === GroupBy.Brand) {
      const product = await this.getProduct(orderProduct.product.id);
      return product.brand
    }
    if (params.groupBy?.toLowerCase() === GroupBy.Category) {
      const product = await this.getProduct(orderProduct.product.id);
      return product.category
    }

    return this.getProduct(orderProduct.product.id);
  }

  async getAnalytics(params: SalesQueryDTO, authToken: string): Promise<AnalyticsDTO> {
    const baskets = await this.getBaskets(params, authToken);
    const analytics: any = {}

    for (let basket of baskets) {
      for (let orderProduct of basket.orderProducts) {
        const data = await this.getAnalyticsData(params, basket, orderProduct, authToken)
        if (!analytics[data.id]) {

          analytics[data.id] = {
            qty: 0,
            amount: 0,
            ...data
          }
        }

        const ratingParams: RatingQueryParams = {
          userId: params.groupBy?.toLowerCase() === GroupBy.User ? data.id : undefined,
          productId: params.groupBy?.toLowerCase() !== GroupBy.User ? orderProduct.product.id : undefined,
        }

        if (!analytics[data.id].avgRating) {
          analytics[data.id].avgRating = await this.getRating(authToken, ratingParams);
        }

        analytics[data.id].qty += orderProduct.qty
        analytics[data.id].amount += orderProduct.qty * orderProduct.productPrice;
      }
    }
    const analyticsList = this.mergeAnalyticsList(analytics);

    return this.countTotalAmount(analyticsList)
  }

  async getDynamic(params: DynamicQueryDTO, authToken: string): Promise<DynamicDTO[]> {
    let { from, to, step } = params;

    if (!from || !to || !step) {
      throw new CustomExternalError([ErrorCode.DYNAMIC_EMPTY_QUERY], HttpStatus.BAD_REQUEST);
    }

    from = new Date(from);
    to = new Date(to);

    return step?.toLowerCase() === Steps.Day ?
      this.getDynamicDay(from, to, authToken) :
      this.getDynamicMonth(from, to, authToken);

  }

  async getUsers(params: UsersQueryDTO, authToken: string) {
    const users = await axios.get(`${process.env.AUTH_DB}/users`, {
        headers: {
          Authorization: authToken
        },
        params: params
      }
    );

    return {
      data: users.data,
      qty: users.data.length
    }
  }

  async getDynamicDay(from: Date, to: Date, authToken: string): Promise<DynamicDTO[]> {
    const dynamic: DynamicDTO[] = []

    for (let date = from; date <= to; date.setDate(date.getDate() + 1)) {
      let updatedTo = new Date(date);
      updatedTo.setDate(updatedTo.getDate() + 1)

      const data = await this.getAnalytics({
        updatedFrom: date,
        updatedTo: updatedTo,
        status: BasketStatus.Completed,
      }, authToken)

      dynamic.push({
        date: date.toISOString(),
        amount: data.totalAmount,
      })
    }

    return dynamic;
  }

  async getDynamicMonth(from: Date, to: Date, authToken: string): Promise<DynamicDTO[]> {
    const dynamic: DynamicDTO[] = []

    for (let date = from; date <= to; date.setMonth(date.getMonth() + 1)) {
      let updatedTo = new Date(date);
      updatedTo.setMonth(updatedTo.getMonth() + 1)

      const data = await this.getAnalytics({
        updatedFrom: date,
        updatedTo: updatedTo,
        status: BasketStatus.Completed,
      }, authToken)

      dynamic.push({
        date: date.toISOString(),
        amount: data.totalAmount,
      })
    }

    return dynamic;
  }

  mergeAnalyticsList(analytics: any): AnalyticsData[] {
    const data: AnalyticsData[] = []

    for (let id in analytics) {
      data.push(analytics[id])
    }

    data.sort((a, b) => {
      if (a.amount < b.amount) return 1;
      if (a.amount > b.amount) return -1;

      return 0
    })

    return data
  }

  countTotalAmount(data: AnalyticsData[]): AnalyticsDTO {
    let totalAmount: number = 0

    data.map(product => {
      totalAmount += product.amount;
    })

    return {
      data: data,
      totalAmount: totalAmount
    }
  }

  async getBaskets(params: SalesQueryDTO, authToken: string): Promise<BasketDTO[]> {
    const baskets = await axios.get(`${process.env.ORDERS_DB}/baskets`, {
      headers: {
        Authorization: authToken
      },
      params: params
    });

    return baskets.data;
  }

  async getProduct(id: string): Promise<Product> {
    const product = await axios.get(`${process.env.CATALOG_DB}/products/${id}`);

    return product.data
  }

  async getRating(authToken: string, params: RatingQueryParams): Promise<number> {
    const reviews = await axios.get(`${process.env.REVIEWS_DB}/reviews`, {
        headers: {
          Authorization: authToken
        },
        params: params
      }
    );

    let counter: number = 0;
    let totalRating: number = 0;


    reviews.data.map((review: Review) => {
      totalRating += review.rating;
      counter += 1;
    })

    return +(totalRating / counter).toFixed(2);
  }

  async getUser(id: string, authToken: string): Promise<User> {
    const user = await axios.get(`${process.env.AUTH_DB}/users/${id}`, {
      headers: {
        Authorization: authToken
      },
    });

    return user.data
  }
}
