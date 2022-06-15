import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { Item } from '../core/entities/item.entity';
import { HttpStatus } from '../core/lib/http-status';

@singleton()
export class ItemService {
  private itemRepository: Repository<Item>;

  constructor(appDataSource: DataSource) {
    this.itemRepository = appDataSource.getRepository(Item);
  }

  async getItems(): Promise<Item[]> {
    return await this.itemRepository.find();
  }

  async getItem(id: string): Promise<Item> {
    try {
      const item = await this.itemRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
    });
      return item;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async createItem(newItem: Item): Promise<Item> {
    return this.itemRepository.save(newItem);
  }

  async updateItem(id: string, itemDTO: Item) {
    try {
      const item = await this.itemRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.itemRepository.update(id, {
        ...item,
        ...itemDTO
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeItem(id: string) {
    try {
      await this.itemRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.itemRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
