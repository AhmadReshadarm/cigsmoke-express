import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import {  } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { TagService } from './tag.service';
import { Controller, Delete, Get, Post, Put } from '../../core/decorators';

@singleton()
@Controller('/tags')
export class TagController {
  constructor(private tagService: TagService) {}

  @Get()
  async getTags(req: Request, resp: Response) {
    const tags = await this.tagService.getTags();

    resp.json(tags);
  }

  @Get(':id')
  async getTag(req: Request, resp: Response) {
    const { id } = req.params;
    const tag = await this.tagService.getTag(id);

    resp.json(tag);
  }

  @Post('')
  async createTag(req: Request, resp: Response) {
    const created = await this.tagService.createTag(req.body);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateTag(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.tagService.updateTag(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeTag(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.tagService.removeTag(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
