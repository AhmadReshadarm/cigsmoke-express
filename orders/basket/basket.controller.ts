import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { Basket } from '../../core/entities';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { BasketService } from './basket.service';

@singleton()
export class BasketController {
  readonly routes = Router();

  constructor(private basketService: BasketService) {
    this.routes.get('/baskets', this.getBaskets);
    this.routes.get('/baskets/:id', this.getBasket);
    this.routes.post('/baskets', this.createBasket);
    this.routes.put('/baskets/:id', this.updateBasket);
    this.routes.delete('/baskets/:id', this.removeBasket);
  }

  private getBaskets = asyncHandler(async (req: Request, resp: Response) => {
    const baskets = await this.basketService.getBaskets(req.query);

    resp.json(baskets);
  });

  private getBasket = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const basket = await this.basketService.getBasket(id);

    resp.json(basket);
  });

  private createBasket = asyncHandler(async (req: Request, resp: Response) => {
    const newBasket = await validation(new Basket(req.body));
    const created = await this.basketService.createBasket(newBasket);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateBasket = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.basketService.updateBasket(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeBasket = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.basketService.removeBasket(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
