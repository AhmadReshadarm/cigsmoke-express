import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { Order } from '../core/entities/order.entity';
import { HttpStatus } from '../core/lib/http-status';

@singleton()
export class OrderService {
  private orderRepository: Repository<Order>;

  constructor(dataSource: DataSource) {
    this.orderRepository = dataSource.getRepository(Order);
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
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async createOrder(newOrder: Order): Promise<Order> {
    return this.orderRepository.save(newOrder);
  }

  async updateOrder(id: string, orderDTO: Order) {
    try {
      const order = await this.orderRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.orderRepository.update(id, {
        ...order,
        ...orderDTO
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
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
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
