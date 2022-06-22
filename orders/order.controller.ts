import { Request, Response } from 'express';
import { injectable } from 'tsyringe';

import { AppRouter } from '../core/app.router';
import { Controller, Delete, Get, Post, Put } from '../core/decorators';
import { Order } from '../core/entities/order.entity';
import { HttpStatus } from '../core/lib/http-status';
import { OrderService } from './order.service';
import { validation } from '../core/lib/validator';

@injectable()
@Controller('/orders')
export class OrderController {
  static readonly routes = AppRouter.router;

  constructor(
    private orderService: OrderService
  ) {}

  @Get()
  async getOrders(req: Request, resp: Response) {
    const orders = await this.orderService.getOrders();

    resp.json(orders);
  };

  @Get(':id')
  async getOrder(req: Request, resp: Response) {
    const { id } = req.params;
    const order = await this.orderService.getOrder(id);

    resp.json(order);
  };

  @Post()
  async createOrder(req: Request, resp: Response) {
    const newOrder = await validation(new Order(req.body));
    const created = await this.orderService.createOrder(newOrder);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  };

  @Put(':id')
  async updateOrder(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.orderService.updateOrder(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  };

  @Delete(':id')
  async removeOrder(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.orderService.removeOrder(id);

    resp.status(HttpStatus.OK).json(removed);
  };
}
