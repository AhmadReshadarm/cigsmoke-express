import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { OrderProduct } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { OrderProductService } from './orderProduct.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { isUser, verifyToken } from '../../core/middlewares';
import { Role } from '../../core/enums/roles.enum';

@singleton()
@Controller('/order-products')
export class OrderProductController {
  constructor(private orderProductService: OrderProductService) {}

  @Get()
  @Middleware([verifyToken, isUser])
  async getOrderProducts(req: Request, resp: Response) {
    if (resp.locals.user.role !== Role.Admin) {
      req.query.userId = String(resp.locals.user.id);
    }

    const orderProducts = await this.orderProductService.getOrderProducts(req.query, req.headers.authorization!);

    resp.json(orderProducts);
  }

  @Get(':id')
  @Middleware([verifyToken, isUser])
  async getOrderProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const orderProduct = await this.orderProductService.getOrderProduct(id, req.headers.authorization!);

    resp.json(orderProduct);
  }

  @Post()
  @Middleware([verifyToken, isUser])
  async createOrderProduct(req: Request, resp: Response) {
    const newOrderProduct = new OrderProduct(req.body)
    newOrderProduct.userId = resp.locals.user.id;
    newOrderProduct.basketId = req.body.inBasket;

    await validation(newOrderProduct);
    const created = await this.orderProductService.createOrderProduct(newOrderProduct, req.headers.authorization!);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  @Middleware([verifyToken, isUser])
  async updateOrderProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.orderProductService.updateOrderProduct(id, req.body, resp.locals.user);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isUser])
  async removeOrderProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.orderProductService.removeOrderProduct(id, resp.locals.user);

    resp.status(HttpStatus.OK).json(removed);
  }
}
