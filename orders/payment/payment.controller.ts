import { IGetPaymentList, YooCheckout } from '@a2seven/yoo-checkout';
import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { v4 } from 'uuid';
import { Controller, Get, Post } from '../../core/decorators';
import { HttpStatus } from '../../core/lib/http-status';

const { SHOP_ID, SHOP_SEECRET_KEY } = process.env;

@singleton()
@Controller('/payments')
export class PaymentController {
  @Get(':id')
  async getPayment(req: Request, resp: Response) {
    const { id } = req.params;

    const checkout = new YooCheckout({
      shopId: SHOP_ID!,
      secretKey: SHOP_SEECRET_KEY!,
    });

    try {
      const payment = await checkout.getPayment(id);
      resp.status(HttpStatus.OK).json(payment);
    } catch (error: any) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.response.data });
    }
  }

  @Get()
  async getPayments(req: Request, resp: Response) {
    const checkout = new YooCheckout({
      shopId: SHOP_ID!,
      secretKey: SHOP_SEECRET_KEY!,
    });
    const filters: IGetPaymentList = { limit: 100 };

    try {
      const paymentList = await checkout.getPaymentList(filters);
      resp.status(HttpStatus.CREATED).json(paymentList);
    } catch (error: any) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.response.data });
    }
  }

  @Post()
  async createPayment(req: Request, resp: Response) {
    const checkout = new YooCheckout({
      shopId: SHOP_ID!,
      secretKey: SHOP_SEECRET_KEY!,
    });
    const idempotenceKey = v4();

    const createPayload: any = {
      amount: {
        value: req.body.value,
        currency: 'RUB',
      },
      confirmation: {
        type: 'embedded',
      },
      capture: true,
      description: 'Заказ №72',
    };

    try {
      const payment = await checkout.createPayment(createPayload, idempotenceKey);
      resp.status(HttpStatus.CREATED).json(payment);
    } catch (error: any) {
      resp.status(HttpStatus.CONFLICT).json({ error: error.response.data });
    }
  }
}
