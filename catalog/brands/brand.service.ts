import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository, TreeRepository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Brand } from '../../core/entities/catalog/brand.entity';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { Product } from '../../core/entities';

@singleton()
export class BrandService {
  private brandRepository: Repository<Brand>;

  constructor(dataSource: DataSource) {
    this.brandRepository = dataSource.getRepository(Brand);
  }

  async getBrands(): Promise<Brand[]> {
    return await this.brandRepository.find();
  }

  async getBrand(id: string): Promise<Brand> {
    try {
      const brand = await this.brandRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return brand;
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getUniqueBrandsFromProducts(products: Product[]): Promise<Brand[]> {
    return products.reduce((acc: Brand[], product:Product ) => {
      if (!acc.find(brand => brand.id === product.brand.id)) {
        return acc.concat(product.brand);
      }
      return acc;
    }, []).sort((a, b) => {
      if (a.id < b.id) return -1;
      if (a.id > b.id) return 1;
      return 0
    });
  }

  async createBrand(brandDTO: Brand): Promise<Brand> {
    const newBrand = await validation(new Brand(brandDTO));
    return this.brandRepository.save(newBrand);
  }

  async updateBrand(id: string, brandDTO: Brand) {
    try {
      const brand = await this.brandRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.brandRepository.update(id, {
        ...brand,
        ...brandDTO
      });
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeBrand(id: string) {
    try {
      await this.brandRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.brandRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }
}
