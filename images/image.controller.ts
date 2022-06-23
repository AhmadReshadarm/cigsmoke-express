import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { asyncHandler } from '../core/lib/error.handlers';
import { ImageService } from './image.service';
import multer from './multer';
import { ImageDto } from './image.dto';
import { DESTINATION } from './config';



@singleton()
export class ImageController {
  readonly routes = Router();

  constructor(private imageService: ImageService) {
    this.routes.get('/images/:fileName', this.getImage);
    this.routes.post('/images', multer.array('files'), this.uploadImages);
  }

  private getImage = asyncHandler(async (req: Request, resp: Response) => {
    const { fileName } = req.params;

    resp.sendFile(fileName, { root: DESTINATION });
  });

  private uploadImages = asyncHandler(async (req: Request, resp: Response) => {
    const files = (req as any).files as ImageDto[];
    await this.imageService.uploadImages(files);

    resp.json(files.map(image => image.filename))
  });

}
