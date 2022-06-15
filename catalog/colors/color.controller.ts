import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { ColorService } from './color.service';

@singleton()
export class ColorController {
  readonly routes = Router();

  constructor(private colorService: ColorService) {
    this.routes.get('/colors', this.getColors);
    this.routes.get('/colors/:id', this.getColor);
    this.routes.post('/colors', this.createColor);
    this.routes.put('/colors/:id', this.updateColor);
    this.routes.delete('/colors/:id', this.removeColor);
  }

  private getColors = asyncHandler(async (req: Request, resp: Response) => {
    const colors = await this.colorService.getColors();

    resp.json(colors);
  });

  private getColor = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const color = await this.colorService.getColor(id);

    resp.json(color);
  });

  private createColor = asyncHandler(async (req: Request, resp: Response) => {
    const created = await this.colorService.createColor(req.body);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateColor = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.colorService.updateColor(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeColor = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.colorService.removeColor(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
