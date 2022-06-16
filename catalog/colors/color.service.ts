import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository, TreeRepository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Color } from '../../core/entities/color.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';

@singleton()
export class ColorService {
  private colorRepository: Repository<Color>;

  constructor(dataSource: DataSource) {
    this.colorRepository = dataSource.getRepository(Color);
  }

  async getColors(): Promise<Color[]> {
    return await this.colorRepository.find();
  }

  async getColor(id: string): Promise<Color> {
    try {
      const color = await this.colorRepository.findOneOrFail({
        where: {
            id: Equal(id),
        },
      });
      return color;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getColorsByIds(ids: string[]): Promise<Color[]> {

    const colorsPromises = ids.map(async colorId => {
      return this.getColor(colorId);
    })

    return Promise.all(colorsPromises);
  }

  async createColor(colorDTO: Color): Promise<Color> {
    const newColor = await validation(new Color(colorDTO));
    return this.colorRepository.save(newColor);
  }

  async updateColor(id: string, colorDTO: Color) {
    try {
      const color = await this.colorRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.colorRepository.update(id, {
        ...color,
        ...colorDTO
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeColor(id: string) {
    try {
      await this.colorRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.colorRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
