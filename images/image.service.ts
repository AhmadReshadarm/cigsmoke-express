import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { Image } from '../core/entities/images/image.entity';
import { HttpStatus } from '../core/lib/http-status';
import { ImageDto } from './image.dto';


@singleton()
export class ImageService {
  private imageRepository: Repository<Image>;

  constructor(dataSource: DataSource) {
    this.imageRepository = dataSource.getRepository(Image);
  }

  async uploadImages(newImages: ImageDto[]): Promise<void> {
    const imagePromises = newImages.map((image) => {
      return this.imageRepository.save({
        filename: image.filename,
        originalName: image.originalname,
        mimeType: image.mimetype,
        size: image.size,
      })
    })
    await Promise.all(imagePromises)
  }
}
