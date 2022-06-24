import { Controller, Delete, Get, Post, Put } from '../../core/decorators';
import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Basket } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { BasketService } from './basket.service';

@singleton()
@Controller('/baskets')
export class BasketController {
  constructor(private basketService: BasketService) {}

  @Get()
  async getBaskets(req: Request, resp: Response) {
    const baskets = await this.basketService.getBaskets(req.query);

    resp.json(baskets);
  }

  @Get(':id')
  async getBasket(req: Request, resp: Response) {
    const { id } = req.params;
    const basket = await this.basketService.getBasket(id);

    resp.json(basket);
  }

  @Post()
  async createBasket(req: Request, resp: Response) {
    const newBasket = await validation(new Basket(req.body));
    const created = await this.basketService.createBasket(newBasket);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateBasket(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.basketService.updateBasket(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeBasket(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.basketService.removeBasket(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
