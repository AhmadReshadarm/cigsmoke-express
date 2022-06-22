import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { OrderProduct } from '../../core/entities';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { OrderProductService } from './orderProduct.service';

@singleton()
export class OrderProductController {
  readonly routes = Router();

  constructor(private orderProductService: OrderProductService) {
    this.routes.get('/orderProducts', this.getOrderProducts);
    this.routes.get('/orderProducts/:id', this.getOrderProduct);
    this.routes.post('/orderProducts', this.createOrderProduct);
    this.routes.put('/orderProducts/:id', this.updateOrderProduct);
    this.routes.delete('/orderProducts/:id', this.removeOrderProduct);
  }

  private getOrderProducts = asyncHandler(async (req: Request, resp: Response) => {
    const orderProducts = await this.orderProductService.getOrderProducts(req.query);

    resp.json(orderProducts);
  });

  private getOrderProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const orderProduct = await this.orderProductService.getOrderProduct(id);

    resp.json(orderProduct);
  });

  private createOrderProduct = asyncHandler(async (req: Request, resp: Response) => {
    const newOrderProduct = await validation(new OrderProduct(req.body));
    const created = await this.orderProductService.createOrderProduct(newOrderProduct);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateOrderProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.orderProductService.updateOrderProduct(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeOrderProduct = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.orderProductService.removeOrderProduct(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
