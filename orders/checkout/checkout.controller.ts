import { Controller, Delete, Get, Post, Put } from '../../core/decorators';
import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Checkout } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { CheckoutService } from './checkout.service';

@singleton()
@Controller('/checkouts')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get()
  async getCheckouts(req: Request, resp: Response) {
    const checkouts = await this.checkoutService.getCheckouts(req.query);

    resp.json(checkouts);
  }

  @Get(':id')
  async getCheckout(req: Request, resp: Response) {
    const { id } = req.params;
    const checkout = await this.checkoutService.getCheckout(id);

    resp.json(checkout);
  }

  @Post()
  async createCheckout(req: Request, resp: Response) {
    const newCheckout = await validation(new Checkout(req.body));
    const created = await this.checkoutService.createCheckout(newCheckout);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateCheckout(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.checkoutService.updateCheckout(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeCheckout (req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.checkoutService.removeCheckout(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
