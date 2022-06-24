import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Checkout } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { CheckoutQueryDTO } from '../order.dtos';

@singleton()
export class CheckoutService {
  private checkoutRepository: Repository<Checkout>;

  constructor(dataSource: DataSource) {
    this.checkoutRepository = dataSource.getRepository(Checkout);
  }

  async getCheckouts(queryParams: CheckoutQueryDTO): Promise<Checkout[]> {
    const {
      addressId,
      paymentId,
      basketId,
      sortBy='basket',
      orderBy='DESC',
      limit=10,
    } = queryParams;

    const queryBuilder = this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.address', 'address')
      .leftJoinAndSelect('checkout.basket', 'basket')
      .leftJoinAndSelect('checkout.payment', 'paymentCard');


    if (addressId) { queryBuilder.andWhere('checkout.addressId = :addressId', {addressId: addressId}) }
    if (paymentId) { queryBuilder.andWhere('checkout.paymentId = :paymentId', {paymentId: paymentId}) }
    if (basketId) { queryBuilder.andWhere('checkout.basketId = :basketId', {basketId: basketId}) }

    return queryBuilder
      .orderBy(`checkout.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();
  }

  async getCheckout(id: string): Promise<Checkout> {
    const queryBuilder = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.address', 'address')
      .leftJoinAndSelect('checkout.basket', 'basket')
      .leftJoinAndSelect('checkout.payment', 'paymentCard')
      .where('checkout.id = :id', {id: id})
      .getOne();

    if (!queryBuilder) { throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND) }

    return queryBuilder
  }

  async createCheckout(newCheckout: Checkout): Promise<Checkout> {
    return this.checkoutRepository.save(newCheckout);
  }

  async updateCheckout(id: string, checkoutDTO: Checkout) {
    try {
      const checkout = await this.checkoutRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });

      return this.checkoutRepository.update(id, {
        ...checkout,
        ...checkoutDTO
      });
    } catch (e) {
      if (e instanceof CustomExternalError) {
        throw new CustomExternalError(e.messages, e.statusCode)
      }
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeCheckout(id: string) {
    try {
      await this.checkoutRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.checkoutRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
