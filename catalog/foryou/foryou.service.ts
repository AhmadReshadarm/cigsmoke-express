import { injectable } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { Foryou } from '../../core/entities';

@injectable()
export class ForyouService {
  private foryouRepository: Repository<Foryou>;
  constructor(dataSource: DataSource) {
    this.foryouRepository = dataSource.getRepository(Foryou);
  }

  async getForyous() {
    const foryous = await this.foryouRepository.find();
    return foryous;
  }

  async getForyou(id: string) {
    const foryou = await this.foryouRepository.findOne({
      where: {
        userId: Equal(id),
      },
    });
    return foryou;
  }

  async getProductId(id: string) {
    const productId = await this.foryouRepository.findOne({
      where: {
        productIds: Equal(id),
      },
    });
    return productId;
  }

  async createForyou(newForyou: Foryou): Promise<Foryou> {
    return this.foryouRepository.save(newForyou);
  }

  async updateForyou(id: string, foryouDTO: Foryou) {
    const foryou = await this.foryouRepository.findOneOrFail({
      where: {
        userId: Equal(id),
      },
    });
    const newForyou = {
      ...foryou,
      ...foryouDTO,
    };
    return this.foryouRepository.save(newForyou);
  }

  async removeForyou(id: string) {
    const foryou = await this.foryouRepository.findOneOrFail({
      where: {
        userId: Equal(id),
      },
    });
    return this.foryouRepository.remove(foryou);
  }
}
