import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { Brand } from '../../core/entities';
import { validation } from '../../core/lib/validator';
import { Product } from '../../core/entities';
import { BrandQueryDTO } from '../catalog.dtos';

@singleton()
export class BrandService {
  private brandRepository: Repository<Brand>;

  constructor(dataSource: DataSource) {
    this.brandRepository = dataSource.getRepository(Brand);
  }

  async getBrands(queryParams: BrandQueryDTO): Promise<Brand[]> {
    const {
      name,
      image,
      showOnMain,
      sortBy = 'name',
      orderBy = 'DESC',
      limit = 10,
    } = queryParams;

    const queryBuilder = await this.brandRepository
      .createQueryBuilder('brand')

    if (name) { queryBuilder.andWhere('brand.name LIKE :name', { name: `%${name}%` }); }
    // if (image) { queryBuilder.andWhere('brand.image LIKE :image', { image: `%${image}%` }); }
    if (showOnMain) { queryBuilder.andWhere('brand.showOnMain = :showOnMain', { showOnMain: showOnMain }); }

    return queryBuilder
      .orderBy(`brand.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();
  }

  async getBrand(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    return brand;
  }

  async getUniqueBrandsFromProducts(products: Product[]): Promise<Brand[]> {
    return products.reduce((acc: Brand[], product: Product) => {
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
    const brand = await this.brandRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    return this.brandRepository.save({
      ...brand,
      ...brandDTO
    });
  }

  async removeBrand(id: string) {
    const brand = await this.brandRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    return this.brandRepository.remove(brand);
  }
}
