import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { OrderProduct } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { OrderProductService } from './orderProduct.service';
import { Controller, Delete, Get, Post, Put } from '../../core/decorators';

@singleton()
@Controller('/order-products')
export class OrderProductController {
  constructor(private orderProductService: OrderProductService) {}

  @Get()
  async getOrderProducts(req: Request, resp: Response) {
    const orderProducts = await this.orderProductService.getOrderProducts(req.query);

    resp.json(orderProducts);
  }

  @Get(':id')
  async getOrderProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const orderProduct = await this.orderProductService.getOrderProduct(id);

    resp.json(orderProduct);
  }

  @Post()
  async createOrderProduct(req: Request, resp: Response) {
    const newOrderProduct = await validation(new OrderProduct(req.body));
    const created = await this.orderProductService.createOrderProduct(newOrderProduct);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateOrderProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.orderProductService.updateOrderProduct(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeOrderProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.orderProductService.removeOrderProduct(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
