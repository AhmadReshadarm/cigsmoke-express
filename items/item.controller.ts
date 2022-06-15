import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../core/lib/error.handlers';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { ItemService } from './item.service';
import { Item } from '../core/entities/item.entity';

@singleton()
export class ItemController {
  readonly routes = Router();

  constructor(private itemService: ItemService) {
    this.routes.get('/items', this.getItems);
    this.routes.get('/items/:id', this.getItem);
    this.routes.post('/items', this.createItem);
    this.routes.put('/items/:id', this.updateItem);
    this.routes.delete('/items/:id', this.removeItem);
  }

  private getItems = asyncHandler(async (req: Request, resp: Response) => {
    const items = await this.itemService.getItems();

    resp.json(items);
  });

  private getItem = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const item = await this.itemService.getItem(id);

    resp.json(item);
  });

  private createItem = asyncHandler(async (req: Request, resp: Response) => {
    const newItem = await validation(new Item(req.body));
    const created = await this.itemService.createItem(newItem);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateItem = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.itemService.updateItem(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeItem = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.itemService.removeItem(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
