import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Tag } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';

@singleton()
export class TagService {
  private tagRepository: Repository<Tag>;

  constructor(dataSource: DataSource) {
    this.tagRepository = dataSource.getRepository(Tag);
  }

  async getTags(): Promise<Tag[]> {
    return await this.tagRepository.find();
  }

  async getTag(id: string): Promise<Tag> {
    try {
      const tag = await this.tagRepository.findOneOrFail({
        where: {
            id: Equal(id),
        },
      });
      return tag;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getTagsByIds(ids: string[]): Promise<Tag[]> {

    const tagsPromises = ids.map(async tagId => {
      return this.getTag(tagId);
    })

    return Promise.all(tagsPromises);
  }

  async createTag(tagDTO: Tag): Promise<Tag> {
    const newTag = await validation(new Tag(tagDTO));

    return this.tagRepository.save(newTag);
  }

  async updateTag(id: string, tagDTO: Tag) {
    try {
      const tag = await this.tagRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.tagRepository.update(id, {
        ...tag,
        ...tagDTO
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeTag(id: string) {
    try {
      await this.tagRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.tagRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
