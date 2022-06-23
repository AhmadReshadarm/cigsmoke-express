import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { Checkout } from '../../core/entities';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { CheckoutService } from './checkout.service';

@singleton()
export class CheckoutController {
  readonly routes = Router();

  constructor(private checkoutService: CheckoutService) {
    this.routes.get('/checkouts', this.getCheckouts);
    this.routes.get('/checkouts/:id', this.getCheckout);
    this.routes.post('/checkouts', this.createCheckout);
    this.routes.put('/checkouts/:id', this.updateCheckout);
    this.routes.delete('/checkouts/:id', this.removeCheckout);
  }

  private getCheckouts = asyncHandler(async (req: Request, resp: Response) => {
    const checkouts = await this.checkoutService.getCheckouts(req.query);

    resp.json(checkouts);
  });

  private getCheckout = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const checkout = await this.checkoutService.getCheckout(id);

    resp.json(checkout);
  });

  private createCheckout = asyncHandler(async (req: Request, resp: Response) => {
    const newCheckout = await validation(new Checkout(req.body));
    const created = await this.checkoutService.createCheckout(newCheckout);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateCheckout = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.checkoutService.updateCheckout(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeCheckout = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.checkoutService.removeCheckout(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
