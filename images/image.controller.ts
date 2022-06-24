import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { ImageService } from './image.service';
import multer from './multer';
import { ImageDto } from './image.dto';
import { DESTINATION } from './config';
import { Controller, Get, Middleware, Post } from '../core/decorators';


@singleton()
@Controller('/images')
export class ImageController {
  constructor(private imageService: ImageService) {}

  @Get(':fileName')
  async getImage(req: Request, resp: Response) {
    const { fileName } = req.params;

    resp.sendFile(fileName, { root: DESTINATION });
  }

  @Post()
  @Middleware([multer.array('files')])
  async uploadImages(req: Request, resp: Response) {
    const files: ImageDto[] = (req as any).files ?? [];
    await this.imageService.uploadImages(files);

    resp.json(files.map(image => image.filename))
  }
}
