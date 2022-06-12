import { Request, Response, Router } from 'express';
import { STATUS_CODES } from 'http';
import { singleton } from 'tsyringe';
import { Order } from '../../entities/order';
import { asyncHandler } from '../../lib/error.handlers';
import { HttpStatus } from '../../lib/http-status';
import { validation } from '../../lib/validator';
import { OrderService } from './order.service';

@singleton()
export class OrderController {
  readonly routes = Router();

  constructor(private orderService: OrderService) {
    this.routes.get('/order', this.getOrders);
    this.routes.get('/order/:id', this.getOrder);
    this.routes.post('/order', this.createOrder);
    this.routes.put('/order/:id', this.updateOrder);
    this.routes.delete('/order/:id', this.removeOrder);
  }

  private getOrders = asyncHandler(async (req: Request, resp: Response) => {
    const orders = await this.orderService.getOrders();

    resp.json(orders);
  });

  private getOrder = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const order = await this.orderService.getOrder(id);

    resp.json(order);
  });

  private createOrder = asyncHandler(async (req: Request, resp: Response) => {
    const newOrder = await validation(new Order(req.body));
    const created = await this.orderService.createOrder(newOrder);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateOrder = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.orderService.updateOrder(id);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeOrder = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.orderService.removeOrder(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
