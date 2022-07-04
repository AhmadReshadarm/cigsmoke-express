import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Basket, Checkout } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { BasketDTO, CheckoutDTO, CheckoutQueryDTO, UserAuth, UserDTO } from '../order.dtos';
import { Role } from '../../core/enums/roles.enum';
import { scope } from '../../core/middlewares/access.user';
import axios from 'axios';

@singleton()
export class CheckoutService {
  private checkoutRepository: Repository<Checkout>;

  constructor(dataSource: DataSource) {
    this.checkoutRepository = dataSource.getRepository(Checkout);
  }

  async getCheckouts(queryParams: CheckoutQueryDTO, authToken: string): Promise<CheckoutDTO[]> {
    const {
      addressId,
      paymentId,
      basketId,
      userId,
      sortBy = 'basket',
      orderBy = 'DESC',
      limit = 10,
    } = queryParams;

    const queryBuilder = this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.address', 'address')
      .leftJoinAndSelect('checkout.basket', 'basket')
      .leftJoinAndSelect('checkout.payment', 'paymentCard');


    if (addressId) { queryBuilder.andWhere('checkout.addressId = :addressId', { addressId: addressId }) }
    if (paymentId) { queryBuilder.andWhere('checkout.paymentId = :paymentId', { paymentId: paymentId }) }
    if (basketId) { queryBuilder.andWhere('checkout.basketId = :basketId', { basketId: basketId }) }
    if (userId) { queryBuilder.andWhere('checkout.userId = :userId', { userId: userId }) }

    const checkouts = await queryBuilder
      .orderBy(`checkout.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();

    const result = checkouts.map(async (checkout) => await this.mergeCheckout(checkout, authToken))
    return Promise.all(result)
  }

  async getCheckout(id: string, authToken: string): Promise<CheckoutDTO> {
    const queryBuilder = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.address', 'address')
      .leftJoinAndSelect('checkout.basket', 'basket')
      .leftJoinAndSelect('checkout.payment', 'paymentCard')
      .where('checkout.id = :id', { id: id })
      .getOne();

    if (!queryBuilder) {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND)
    }

    return this.mergeCheckout(queryBuilder, authToken);
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

  async createCheckout(newCheckout: Checkout, authToken: string): Promise<Checkout> {
    const checkout = await this.checkoutRepository.save(newCheckout);
    if (!await this.validation(checkout.id, authToken)) {
      await this.checkoutRepository.remove(checkout)
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }

    return checkout
  }

  async updateCheckout(id: string, checkoutDTO: Checkout, user: UserAuth) {
    const checkout = await this.checkoutRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    await this.isUserCheckoutOwner(checkout, user);

    return this.checkoutRepository.save({
      ...checkout,
      ...checkoutDTO
    });
  }

  async removeCheckout(id: string, user: UserAuth) {
    const checkout = await this.checkoutRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });
    await this.isUserCheckoutOwner(checkout, user);

    return this.checkoutRepository.remove(checkout);
  }

  isUserCheckoutOwner(checkout: Checkout, user: UserAuth) {
    if (scope(String(checkout.userId), String(user.id)) && user.role !== Role.Admin) {
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }
  }

  async validation(id: string, authToken: string): Promise<boolean> {
    const checkout = await this.getCheckout(id, authToken) as any;

    if (String(checkout.user.id) !== String(checkout.basket.userId)) {
      return false
    }
    if (String(checkout.user.id) !== String(checkout.address.userId)) {
      return false
    }
    if (String(checkout.user.id) !== String(checkout.payment.userId)) {
      return false
    }
    return true;
  }

  async mergeCheckout(checkout: Checkout, authToken: string): Promise<CheckoutDTO> {
    return {
      id: checkout.id,
      user: await this.getUserById(checkout.userId, authToken) ?? checkout.userId,
      basket: checkout.basket,
      payment: checkout.payment,
      address: checkout.address,
      comment: checkout.comment
    }
  }
}
