import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Address, Basket, OrderProduct } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import axios from 'axios';
import { BasketDTO, BasketQueryDTO, UserAuth, UserDTO } from '../order.dtos';
import { Role } from '../../core/enums/roles.enum';
import { scope } from '../../core/middlewares/access.user';

@singleton()
export class BasketService {
  private basketRepository: Repository<Basket>;

  constructor(dataSource: DataSource) {
    this.basketRepository = dataSource.getRepository(Basket);
  }

  async getBaskets(queryParams: BasketQueryDTO, authToken: string): Promise<BasketDTO[]> {
    const {
      userId,
      minTotalAmount,
      maxTotalAmount,
      sortBy='userId',
      orderBy='DESC',
      limit=10,
    } = queryParams;

    const queryBuilder = this.basketRepository
      .createQueryBuilder('basket')
      .leftJoinAndSelect('basket.orderProducts', 'orderProduct')
      .leftJoinAndSelect('basket.checkout', 'checkout')

    if (userId) { queryBuilder.andWhere('basket.userId = :userId', {userId: userId}) }
    if (minTotalAmount) { queryBuilder.andWhere('basket.productTotalAmount >= :amount', {amount: minTotalAmount}) }
    if (maxTotalAmount) { queryBuilder.andWhere('basket.productTotalAmount <= :amount', {amount: maxTotalAmount}) }

    const baskets = await queryBuilder
      .orderBy(`basket.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();

    const result = baskets.map(async (basket) => await this.mergeBasket(basket, authToken))

    return Promise.all(result)
  }

  async getBasket(id: string, authToken: string): Promise<BasketDTO> {
      const queryBuilder = await this.basketRepository
        .createQueryBuilder('basket')
        .leftJoinAndSelect('basket.orderProducts', 'orderProduct')
        .leftJoinAndSelect('basket.checkout', 'checkout')
        .where('basket.id = :id', {id: id})
        .getOne();

      if (!queryBuilder) { throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND) }

      return this.mergeBasket(queryBuilder, authToken)
    }

  async getUserById(id: string, authToken: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`, {
        headers: {
          Authorization: authToken!
        }
      });

      return res.data
    } catch (e: any) {
      if (e.name === 'AxiosError' && e.response.status === 403) {
        throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
      }
    }
  }

  getTotalAmount(products: OrderProduct[]): number {
    return products.reduce((accum: number, product) => {
      accum += product.qty * product.productPrice;
      return accum;
    }, 0)
  }

  async createBasket(newBasket: Basket): Promise<Basket> {
    return this.basketRepository.save(newBasket);
  }

  async updateBasket(id: string, basketDTO: Basket, user: UserAuth) {
    const basket = await this.basketRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });

    await this.isUserBasketOwner(basket, user);

    return this.basketRepository.save({
      ...basket,
      ...basketDTO
    });
  }

  async removeBasket(id: string, user: UserAuth) {
    const basket = await this.basketRepository.findOneOrFail({
      where: {
          id: Equal(id),
      }
    });
    await this.isUserBasketOwner(basket, user);

    return this.basketRepository.remove(basket);
  }

  isUserBasketOwner(basket: Basket, user: UserAuth ) {
    if (scope(String(basket.userId), String(user.id)) && user.role !== Role.Admin) {
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }
  }

  async mergeBasket(basket: Basket, authToken: string): Promise<BasketDTO> {

    return {
      id: basket.id,
      user: await this.getUserById(basket.userId, authToken) ?? basket.userId,
      orderProducts: basket.orderProducts,
      checkout: basket.checkout,
      totalAmount: this.getTotalAmount(basket.orderProducts),
      createdAt: basket.createdAt,
      updatedAt: basket.updatedAt,
    }
  }
}
