import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Basket, OrderProduct } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import axios from 'axios';
import { BasketDTO, BasketQueryDTO , UserDTO } from '../order.dtos';

@singleton()
export class BasketService {
  private basketRepository: Repository<Basket>;

  constructor(dataSource: DataSource) {
    this.basketRepository = dataSource.getRepository(Basket);
  }

  async getBaskets(queryParams: BasketQueryDTO): Promise<BasketDTO[]> {
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

    const result = baskets.map(async (basket) => await this.mergeBasket(basket))

    return Promise.all(result)
  }

  async getBasket(id: string): Promise<BasketDTO> {
      const queryBuilder = await this.basketRepository
        .createQueryBuilder('basket')
        .leftJoinAndSelect('basket.orderProducts', 'orderProduct')
        .leftJoinAndSelect('basket.checkout', 'checkout')
        .where('basket.id = :id', {id: id})
        .getOne();

      if (!queryBuilder) { throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND) }

      this.getTotalAmount(queryBuilder.orderProducts)
      return this.mergeBasket(queryBuilder)
    }

  async getUsersById(id: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`);

      return res.data;
    } catch (e) {
      console.error(e)
      throw new CustomExternalError([ErrorCode.USER_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  getTotalAmount(products: OrderProduct[]): number {
    return products.reduce((accum: number, product) => {
      accum += product.qty * product.productPrice;
      return accum;
    }, 0)
  }

  async createBasket(newBasket: Basket): Promise<Basket> {
    await this.getUsersById(newBasket.userId);

    return this.basketRepository.save(newBasket);
  }

  async updateBasket(id: string, basketDTO: Basket) {
    try {
      const basket = await this.basketRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      await this.getUsersById(basketDTO.userId);

      return this.basketRepository.update(id, {
        ...basket,
        ...basketDTO
      });
    } catch (e) {
      if (e instanceof CustomExternalError) {
        throw new CustomExternalError(e.messages, e.statusCode)
      }
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeBasket(id: string) {
    try {
      await this.basketRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.basketRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async mergeBasket(basket: Basket): Promise<BasketDTO> {

    return {
      id: basket.id,
      user: await this.getUsersById(basket.userId),
      orderProducts: basket.orderProducts,
      checkout: basket.checkout,
      totalAmount: this.getTotalAmount(basket.orderProducts),
      createdAt: basket.createdAt,
      updatedAt: basket.updatedAt,
    }
  }
}
