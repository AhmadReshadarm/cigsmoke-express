import { Controller, Delete, Get, Post, Put } from '../../core/decorators';
import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { HttpStatus } from '../../core/lib/http-status';
import { ColorService } from './color.service';

@singleton()
@Controller('/colors')
export class ColorController {
  constructor(private colorService: ColorService) {}

  @Get()
  async getColors(req: Request, resp: Response) {
    const colors = await this.colorService.getColors();

    resp.json(colors);
  }

  @Get(':id')
  async getColor(req: Request, resp: Response) {
    const { id } = req.params;
    const color = await this.colorService.getColor(id);

    resp.json(color);
  }

  @Post()
  async createColor(req: Request, resp: Response) {
    const created = await this.colorService.createColor(req.body);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateColor(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.colorService.updateColor(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeColor(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.colorService.removeColor(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
