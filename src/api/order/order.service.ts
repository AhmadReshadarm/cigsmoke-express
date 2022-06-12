import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../domain/error/custom.external.error';
import { ErrorCode } from '../../domain/error/error.code';
import { Order } from '../../entities/order';

@singleton()
export class OrderService {
  private orderRepository: Repository<Order>;

  constructor(appDataSource: DataSource) {
    this.orderRepository = appDataSource.getRepository(Order);
  }

  async getOrders(): Promise<Order[]> {
    return await this.orderRepository.find();
  }

  async getOrder(id: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
    });
      return order;
    } catch {
      throw new CustomExternalError([ErrorCode.ORDER_NOT_FOUND], 404);
    }
  }

  async createOrder(newOrder: Order): Promise<Order> {
    return this.orderRepository.save(newOrder);
  }

  async updateOrder(id: string) {
    try {
      const order = await this.orderRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      console.log(order);
      return this.orderRepository.update(id, order);
    } catch {
      throw new CustomExternalError([ErrorCode.ORDER_NOT_FOUND], 404);
    }
  }

  async removeOrder(id: string) {
    try {
      await this.orderRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.orderRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ORDER_NOT_FOUND], 404);
    }
  }
}