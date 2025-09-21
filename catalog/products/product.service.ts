import { injectable } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Product, ProductVariant, Review, User, ProductParameter, Color } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { ProductDTO, ProductQueryDTO } from '../catalog.dtos';
import { PaginationDTO, RatingDTO } from '../../core/lib/dto';
import axios from 'axios';
import { validation } from '../../core/lib/validator';

@injectable()
export class ProductService {
  private productRepository: Repository<Product>;
  private productVariantRepository: Repository<ProductVariant>;
  private productColorRepository: Repository<Color>;
  private productParamRepository: Repository<ProductParameter>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
    this.productVariantRepository = dataSource.getRepository(ProductVariant);
    this.productColorRepository = dataSource.getRepository(Color);
    this.productParamRepository = dataSource.getRepository(ProductParameter);
  }

  async getProducts(queryParams: ProductQueryDTO): Promise<PaginationDTO<ProductDTO>> {
    const {
      name,
      userHistory,
      minPrice,
      maxPrice,
      desc,
      available,
      colors,
      color,
      categories,
      parent,
      category,
      tags,
      tag,
      sortBy = 'name',
      orderBy = 'DESC',
      offset = 0,
      limit = 10,
      image,
    } = queryParams;
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent')
      .leftJoinAndSelect('product.tags', 'tag')
      // .leftJoinAndSelect('product.parameterProducts', 'parameterProducts')
      .leftJoinAndSelect('product.productVariants', 'productVariant')
      // .leftJoinAndSelect('productVariant.parameterProducts', 'parameterProducts')
      .leftJoinAndSelect('productVariant.color', 'color');

    if (name) {
      const trimmedName = name.trim();

      if (trimmedName) {
        const keywords = trimmedName.split(/\s+/).filter(k => k.length > 0);

        if (keywords.length === 1) {
          // Single keyword search
          const keyword = keywords[0];
          queryBuilder.andWhere(
            `(LOWER(product.name) LIKE :keyword 
             OR LOWER(productVariant.artical) LIKE :keyword 
             OR LOWER(product.keywords) LIKE :keyword)`,
            { keyword: `%${keyword.toLowerCase()}%` },
          );
        } else {
          // Multi-keyword search - all must match
          keywords.forEach((keyword, index) => {
            const paramName = `nameKeyword${index}`;
            queryBuilder.andWhere(
              `(LOWER(product.name) LIKE :${paramName} 
               OR LOWER(productVariant.artical) LIKE :${paramName} 
               OR LOWER(product.keywords) LIKE :${paramName})`,
              { [paramName]: `%${keyword.toLowerCase()}%` },
            );
          });
        }
      }
    }

    if (minPrice) {
      queryBuilder.andWhere('productVariant.price >= :minPrice', { minPrice: minPrice });
    }
    if (maxPrice) {
      queryBuilder.andWhere('productVariant.price <= :maxPrice', { maxPrice: maxPrice });
    }
    if (image) {
      queryBuilder.andWhere('productVariant.images LIKE :image', { image: `%${image}%` });
    }
    if (desc) {
      queryBuilder.andWhere('product.desc LIKE :desc', { desc: `%${desc}%` });
    }
    if (available) {
      queryBuilder.andWhere('productVariant.available = :available', { available: `%${available}%` });
    }
    if (colors) {
      queryBuilder.andWhere('color.url IN (:...colors)', { colors: colors });
    }
    if (color) {
      queryBuilder.andWhere('color.url = :color', { color: color });
    }
    if (parent) {
      queryBuilder.andWhere('categoryParent.url = :parent', { parent: parent });
    }
    if (categories) {
      queryBuilder.andWhere('category.url IN (:...categories)', { categories: categories });
    }
    if (category) {
      queryBuilder.andWhere('category.url = :category', { category: category });
    }
    if (tags) {
      queryBuilder.andWhere('tag.url IN (:...tags)', { tags: tags });
    }
    if (tag) {
      queryBuilder.andWhere('tag.url = :tag', { tag: tag });
    }
    if (userHistory) {
      queryBuilder.andWhere('product.id IN (:...ids)', { ids: userHistory });

      // Add custom ordering based on userHistory array position
      const caseStatements = userHistory
        .map((id, index) => `WHEN product.id = :userHistoryId${index} THEN ${index}`)
        .join(' ');
      const elseCase = userHistory.length;

      queryBuilder
        .addSelect(`CASE ${caseStatements} ELSE ${elseCase} END`, 'custom_order')
        .orderBy('custom_order', 'ASC');

      // Add parameters for each ID in history
      userHistory.forEach((id, index) => {
        queryBuilder.setParameter(`userHistoryId${index}`, id);
      });
    } else {
      // Default sorting when no userHistory is provided
      queryBuilder.orderBy(`product.${sortBy}`, orderBy);
    }

    queryBuilder.skip(offset).take(limit);

    const products = await queryBuilder.getMany();

    // queryBuilder.orderBy(`product.${sortBy}`, orderBy).skip(offset).take(limit);

    // const products = await queryBuilder.getMany();

    const results = products.map(async product => await this.mergeProduct(product));

    return {
      rows: await Promise.all(results),
      length: await queryBuilder.getCount(),
    };
  }

  async getProductsPriceRange(
    queryParams: ProductQueryDTO,
  ): Promise<{ minPrice: number; maxPrice: number } | undefined> {
    const { name, parent, categories, parameters } = queryParams;
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent')
      .leftJoinAndSelect('product.productVariants', 'productVariant')
      .leftJoinAndSelect('productVariant.parameters', 'parameters');

    if (name) {
      queryBuilder.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (parent) {
      queryBuilder.andWhere('categoryParent.url = :parent', { parent: parent });
    }
    if (categories) {
      queryBuilder.andWhere('category.url IN (:...categories)', { categories: categories });
    }
    if (parameters?.length) {
      parameters.forEach(param => {
        const [key, value] = param.split('|');
        queryBuilder
          .andWhere(qb => {
            const subQuery = qb
              .subQuery()
              .select('pv.id')
              .from(ProductVariant, 'pv')
              .leftJoin('pv.parameters', 'param')
              .where('pv.productId = product.id')
              .andWhere('param.key = :key AND param.value = :value')
              .getQuery();
            return `EXISTS ${subQuery}`;
          })
          .setParameters({ key, value });
      });
    }
    //  TODO add price rang based on tags, colors
    return queryBuilder
      .select('MIN(productVariant.price)', 'minPrice')
      .addSelect('MAX(productVariant.price)', 'maxPrice')
      .getRawOne();
  }

  async getProduct(id: string): Promise<ProductDTO> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.productVariants', 'productVariant')
      .leftJoinAndSelect('productVariant.color', 'color')
      .leftJoinAndSelect('productVariant.parameters', 'parameters')
      .where('product.id = :id', { id: id })
      .getOne();

    if (!product) {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }

    return this.mergeProduct(product);
  }

  async createProductVariant(variantData: any, product: Product) {
    let colorEntity: Color | null = null;
    if (variantData.color) {
      colorEntity = await this.productColorRepository.findOneBy({ id: String(variantData.color) }); // Fetch Color entity by ID
      if (!colorEntity) {
        throw new Error(`Color with ID ${variantData.color} not found.`); // Handle case where color is not found
      }
    }

    const newVariant = new ProductVariant({
      ...variantData,
      price: Number(variantData.price),
      available: Boolean(variantData.available),
      color: colorEntity,
      product: product,
      parameters: [],
    });

    if (variantData.parameters && Array.isArray(variantData.parameters)) {
      newVariant.parameters = variantData.parameters.map((paramData: ProductParameter) => {
        return new ProductParameter({ key: paramData.key, value: paramData.value });
      });
    }
    return await this.productVariantRepository.save(newVariant);
  }

  async updateProductVariant(variantDataInDB: ProductVariant, userPassedVariant: ProductVariant) {
    await this.productVariantRepository.save({
      ...variantDataInDB,
      ...userPassedVariant,
    });
    const updatedVariant = await this.productVariantRepository.findOne({
      where: { id: Equal(variantDataInDB.id) },
    });

    return {
      ...updatedVariant,
    };
  }

  async getProductByUrl(url: string): Promise<ProductDTO> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.productVariants', 'productVariant')
      .leftJoinAndSelect('productVariant.color', 'color')
      .leftJoinAndSelect('productVariant.parameters', 'parameters')
      .where('product.url = :url', { url: url })
      .getOne();

    if (!product) {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }

    return await this.mergeProduct(product);
  }

  async createProduct(newProduct: Product): Promise<Product> {
    const created = await this.productRepository.save(new Product(newProduct));

    if (newProduct.productVariants) {
      await Promise.all(
        newProduct.productVariants.map(async variantData => {
          await this.createProductVariant(variantData, created);
        }),
      );
    }

    return created;
  }

  async updateProduct(id: string, productDTO: Product) {
    const product = await this.productRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
      relations: ['productVariants', 'productVariants.color', 'productVariants.parameters'],
    });

    const { productVariants, ...others } = productDTO;

    const savedProduct = await this.productRepository.save({
      ...product,
      ...others,
    });

    if (productVariants) {
      await validation(productVariants);

      await Promise.all(
        product.productVariants.map(async variantInDB => {
          const isUserPassedVariantInDB = productVariants.find(({ id }) => variantInDB.id == id.toString());
          if (isUserPassedVariantInDB) {
            // get the existing parameters from the database variant
            const existingParamsInDB = variantInDB.parameters;
            // Get the parameters from the DTO
            const userPassedParams = isUserPassedVariantInDB.parameters || [];

            existingParamsInDB.forEach(async paramInDB => {
              // Check if the existing parameter is present in the DTO parameters
              const isParamPresent = userPassedParams.some(param => param.id === paramInDB.id);
              if (!isParamPresent) {
                await this.productParamRepository.remove(paramInDB);
              }
            });
          }
          //  Remove variant if not in DB
          if (!isUserPassedVariantInDB) {
            await this.productVariantRepository.remove(variantInDB);
          }
        }),
      );

      const updatedVariantsInDB = await Promise.all(
        productDTO.productVariants.map(async userPassedVariant => {
          const variantInDB = await this.productVariantRepository.findOne({
            where: {
              id: Equal(userPassedVariant.id),
            },
          });

          if (!variantInDB) {
            const variantData = new ProductVariant({ ...(userPassedVariant as any) });
            return await this.createProductVariant(variantData, product);
          }

          if (variantInDB) {
            return await this.updateProductVariant(variantInDB, userPassedVariant);
          }
        }),
      );
      return {
        ...savedProduct,
        ...updatedVariantsInDB,
      };
    }

    return {
      ...savedProduct,
      ...product.productVariants,
    };
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

  async getQuestionsByProductId(id: string): Promise<PaginationDTO<Review> | null> {
    const reviews = await axios.get(`${process.env.QUESTIONS_DB}/questions/`, {
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

  async mergeProduct(product: Product): Promise<any> {
    const rawReviews = (await this.getReviewsByProductId(product.id)) as any;
    const rawQuestions = (await this.getQuestionsByProductId(product.id)) as any;
    const rating = rawReviews ? await this.getProductRatingFromReviews(rawReviews) : null;
    const reviews = [];

    const users = {} as any;
    if (Array.isArray(rawReviews?.rows)) {
      for (const review of rawReviews?.rows) {
        if (!users[review.userId]) {
          users[review.userId] = await this.getUserById(review.userId);
        }

        const comments = [];

        for (const comment of review.comments) {
          if (!users[comment.userId]) {
            users[comment.userId] = await this.getUserById(comment.userId);
          }

          comments.push({
            ...comment,
            user: users[comment.userId],
          });
        }

        reviews.push({
          ...review,
          user: users[review.userId],
          comments: comments,
        });
      }
    }

    const questions = [];

    if (Array.isArray(rawQuestions?.rows)) {
      for (const question of rawQuestions?.rows) {
        if (!users[question.userId]) {
          users[question.userId] = await this.getUserById(question.userId);
        }

        const comments = [];

        for (const comment of question.comments) {
          if (!users[comment.userId]) {
            users[comment.userId] = await this.getUserById(comment.userId);
          }

          comments.push({
            ...comment,
            user: users[comment.userId],
          });
        }

        questions.push({
          ...question,
          user: users[question.userId],
          comments: comments,
        });
      }
    }

    return {
      ...product,
      rating: rating,
      reviews: reviews,
      questions: questions,
    };
  }

  async getUserById(id: string): Promise<User | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/inner/${id}`, {
        data: { secretKey: process.env.INNER_AUTH_CALL_SECRET_KEY },
      });

      return res.data;
    } catch (e: any) {
      if (e.name === 'AxiosError' && e.response.status === 403) {
        throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
      }
    }
  }

  getProductVariantsImages(productVariants?: ProductVariant[]) {
    let images: string[] = [];
    productVariants?.forEach(variant => {
      const variantImages = variant.images ? variant.images.split(', ') : [];
      images = images.concat(variantImages);
    });
    return images;
  }
}
