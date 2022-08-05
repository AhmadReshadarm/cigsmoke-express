import { injectable } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { ParameterProducts, Product, Review } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { ProductDTO, ProductQueryDTO } from '../catalog.dtos';
import { PaginationDTO, RatingDTO } from '../../core/lib/dto';
import axios from 'axios';
import { validation } from '../../core/lib/validator';

@injectable()
export class ProductService {
  private productRepository: Repository<Product>;
  private parameterProductsRepository: Repository<ParameterProducts>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
    this.parameterProductsRepository = dataSource.getRepository(ParameterProducts);
  }

  async getProducts(queryParams: ProductQueryDTO): Promise<PaginationDTO<ProductDTO>> {
    const {
      name,
      minPrice,
      maxPrice,
      desc,
      available,
      colors,
      categories,
      parent,
      brands,
      tags,
      sortBy = 'name',
      orderBy = 'DESC',
      offset = 0,
      limit = 10,
    } = queryParams;
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.colors', 'color')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.parameterProducts', 'parameterProducts');

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (minPrice) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice: minPrice });
    }
    if (maxPrice) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice: maxPrice });
    }
    if (desc) {
      queryBuilder.andWhere('product.desc LIKE :desc', { desc: `%${desc}%` });
    }
    if (available) {
      queryBuilder.andWhere('product.available EQUAL :available', { available: `%${available}%` });
    }
    if (colors) {
      queryBuilder.andWhere('color.url IN (:...colors)', { colors: colors });
    }
    if (parent) {
      queryBuilder.andWhere('categoryParent.url = :parent', { parent: parent });
    }
    if (categories) {
      queryBuilder.andWhere('category.url IN (:...categories)', { categories: categories });
    }
    if (brands) {
      queryBuilder.andWhere('brand.url IN (:...brands)', { brands: brands });
    }
    if (tags) {
      queryBuilder.andWhere('tag.url IN (:...tags)', { tags: tags });
    }

    queryBuilder.orderBy(`product.${sortBy}`, orderBy).skip(offset).take(limit);

    const products = await queryBuilder.getMany();
    const result = products.map(async product => await this.mergeProduct(product));

    return {
      rows: await Promise.all(result),
      length: await queryBuilder.getCount(),
    };
  }

  async getProductsPriceRange(
    queryParams: ProductQueryDTO,
  ): Promise<{ minPrice: number; maxPrice: number } | undefined> {
    const { name, parent, categories } = queryParams;
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent');

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (parent) {
      queryBuilder.andWhere('categoryParent.url = :parent', { parent: parent });
    }
    if (categories) {
      queryBuilder.andWhere('category.url IN (:...categories)', { categories: categories });
    }

    return queryBuilder
      .select('MIN(product.price)', 'minPrice')
      .addSelect('MAX(product.price)', 'maxPrice')
      .getRawOne();
  }

  async getProduct(id: string): Promise<ProductDTO> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.colors', 'color')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('category.parameters', 'parameter')
      .leftJoinAndSelect('product.parameterProducts', 'parameterProducts')
      .where('product.id = :id', { id: id })
      .getOne();

    if (!product) {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }

    return this.mergeProduct(product);
  }

  async createParameters(parameters: ParameterProducts[], id: string) {
    parameters.map(async parameter => {
      parameter.productId = id;
      return await this.parameterProductsRepository.save(parameter);
    });
  }

  async getProductByUrl(url: string): Promise<Product> {
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.colors', 'color')
      .leftJoinAndSelect('product.tags', 'tag')
      .where('product.url = :url', { url: url })
      .getOne();

    if (!queryBuilder) {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }

    return queryBuilder;
  }

  async createProduct(newProduct: Product): Promise<Product> {
    if (newProduct.parameterProducts) {
      await validation(newProduct.parameterProducts);
    }

    const created = await this.productRepository.save(new Product(newProduct));

    if (newProduct.parameterProducts) {
      await this.createParameters(newProduct.parameterProducts, created.id);
    }

    return created;
  }

  async updateProduct(id: string, productDTO: Product) {
    const product = await this.productRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });

    if (productDTO.parameterProducts) {
      await validation(productDTO.parameterProducts);

      if (product.parameterProducts) {
        product.parameterProducts.map(async (parameterProduct) => {
          await this.parameterProductsRepository.remove(parameterProduct)
        })
      }

      await this.createParameters(productDTO.parameterProducts, product.id)
    }

    return this.productRepository.save({
      ...product,
      ...productDTO,
    });
  }

  async removeProduct(id: string) {
    const product = await this.productRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
    });

    return this.productRepository.remove(product);
  }

  async getReviewsByProductId(id: string): Promise<PaginationDTO<Review> | null> {
    const reviews = await axios.get(`${process.env.REVIEWS_DB}/reviews/`, {
      params: {
        productId: id,
        merge: 'false',
        limit: 100000,
      },
    });

    return reviews.data.length > 0 ? reviews.data : null;
  }

  async getProductRatingFromReviews(reviews: PaginationDTO<Review>): Promise<RatingDTO | null> {
    let counter: number = 0;
    let totalRating: number = 0;

    const rating: RatingDTO = {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      'avg': 0,
    };

    reviews.rows.map((review: Review) => {
      const index = String(review.rating);
      rating[index as keyof typeof rating] += 1;

      totalRating += review.rating;
      counter += 1;
    });

    rating.avg = +(totalRating / counter).toFixed(2);
    return rating;
  }

  async mergeProduct(product: Product): Promise<ProductDTO> {
    const reviews = await this.getReviewsByProductId(product.id);
    const rating = reviews ? await this.getProductRatingFromReviews(reviews) : null;

    return {
      ...product,
      rating: rating,
      reviews: reviews?.rows ?? null,
    };
  }
}
