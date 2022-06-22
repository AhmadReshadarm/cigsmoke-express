import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../../core/lib/error.handlers';
import { HttpStatus } from '../../core/lib/http-status';
import { TagService } from './tag.service';

@singleton()
export class TagController {
  readonly routes = Router();

  constructor(private tagService: TagService) {
    this.routes.get('/tags', this.getTags);
    this.routes.get('/tags/:id', this.getTag);
    this.routes.post('/tags', this.createTag);
    this.routes.put('/tags/:id', this.updateTag);
    this.routes.delete('/tags/:id', this.removeTag);
  }

  private getTags = asyncHandler(async (req: Request, resp: Response) => {
    const tags = await this.tagService.getTags();

    resp.json(tags);
  });

  private getTag = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const tag = await this.tagService.getTag(id);

    resp.json(tag);
  });

  private createTag = asyncHandler(async (req: Request, resp: Response) => {
    const created = await this.tagService.createTag(req.body);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateTag = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.tagService.updateTag(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeTag = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.tagService.removeTag(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
