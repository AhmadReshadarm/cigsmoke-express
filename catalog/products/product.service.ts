import { injectable } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Product, ProductVariant, Review, User, ProductParameter, Color } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { ProductDTO, ProductQueryDTO } from '../catalog.dtos';
import { PaginationDTO, ProductPaginationDTO, RatingDTO } from '../../core/lib/dto';
import axios from 'axios';
import { validation } from '../../core/lib/validator';

@injectable()
export class ProductService {
  private productRepository: Repository<Product>;
  private productVariantRepository: Repository<ProductVariant>;
  private productColorRepository: Repository<Color>;

  constructor(dataSource: DataSource) {
    this.productRepository = dataSource.getRepository(Product);
    this.productVariantRepository = dataSource.getRepository(ProductVariant);
    this.productColorRepository = dataSource.getRepository(Color);
  }

  async getProducts(queryParams: ProductQueryDTO): Promise<ProductPaginationDTO<ProductDTO>> {
    const {
      name,
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
      parameters,
    } = queryParams;
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.productVariants', 'productVariant')
      .leftJoinAndSelect('productVariant.color', 'color')
      .leftJoinAndSelect('productVariant.parameters', 'parameters');

    if (name) {
      const keywords = name.toLowerCase().split(/\s+/);

      let query = queryBuilder;

      keywords.forEach((keyword, index) => {
        if (index === 0) {
          query = query.where(
            `LOWER(product.name) LIKE :keyword 
        OR LOWER(productVariant.artical) LIKE :keyword 
        OR LOWER(product.keywords) LIKE :keyword`,
            { keyword: `%${keyword}%` },
          );
        } else {
          query = query.orWhere(
            `LOWER(product.name) LIKE :keyword 
        OR LOWER(productVariant.artical) LIKE :keyword 
        OR LOWER(product.keywords) LIKE :keyword`,
            { keyword: `%${keyword}%` },
          );
        }
      });
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

    queryBuilder.orderBy(`product.${sortBy}`, orderBy).skip(offset).take(limit);

    const products = await queryBuilder.getMany();
    const parameterGroups: { [key: string]: Set<string> } = {};

    products.forEach(product => {
      product.productVariants.forEach(variant => {
        variant.parameters.forEach(param => {
          if (!parameterGroups[param.key]) {
            parameterGroups[param.key] = new Set();
          }
          parameterGroups[param.key].add(param.value);
        });
      });
    });

    // Convert Sets to Arrays
    const formattedGroups: { [key: string]: string[] } = {};
    Object.entries(parameterGroups).forEach(([key, values]) => {
      formattedGroups[key] = Array.from(values);
    });

    const results = products.map(async product => await this.mergeProduct(product));

    return {
      rows: await Promise.all(results),
      length: await queryBuilder.getCount(),
      parameterGroups: formattedGroups,
    };
  }
  // current response 👇
  //   {
  //   "rows": [...],
  //   "length": 15,
  //   "parameterGroups": {
  //     "Size": ["S", "M", "L"],
  //     "Material": ["Cotton", "Polyester"],
  //     "Color": ["Red", "Blue"]
  //   }
  // }

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

  // async createParameters(parameters: ParameterProducts[], id: string) {
  //   parameters.map(async parameter => {
  //     parameter.productId = id;
  //     return await this.parameterProductsRepository.save(parameter);
  //   });
  // }
  // createParameters = async (parameters: ParameterProducts[], id: string, counter: number) => {
  //   if (parameters.length > counter) {
  //     parameters[counter].productId = id;
  //     await this.parameterProductsRepository.save(parameters[counter]);
  //     counter = counter + 1;
  //     this.createParameters(parameters, id, counter);
  //   }
  // };
  async createProductVariant(variantData: any, product: Product) {
    let colorEntity: Color | null = null;
    if (variantData.color && variantData.color.id) {
      colorEntity = await this.productColorRepository.findOneBy({ id: String(variantData.color.id) }); // Fetch Color entity by ID
      if (!colorEntity) {
        throw new Error(`Color with ID ${variantData.color.id} not found.`); // Handle case where color is not found
      }
    }

    const newVariant = new ProductVariant({
      ...variantData,
      price: Number(variantData.price),
      available: Boolean(variantData.available),
      color: colorEntity || undefined,
      product: product,
      parameters: [],
    });

    if (variantData.parameterProduct && Array.isArray(variantData.parameterProduct)) {
      newVariant.parameters = variantData.parameterProduct.map((paramData: ProductParameter) => {
        return new ProductParameter(paramData.key, paramData.value);
      });
    }
    return await this.productVariantRepository.save(newVariant);
  }

  async getProductByUrl(url: string): Promise<ProductDTO> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('category.parent', 'categoryParent')
      .leftJoinAndSelect('product.tags', 'tag')
      .leftJoinAndSelect('product.parameterProducts', 'parameterProducts')
      .leftJoinAndSelect('parameterProducts.parameter', 'parameter')
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
      relations: ['productVariants', 'productVariants.parameters'],
    });

    const { productVariants, ...others } = productDTO;

    await this.productRepository.save({
      ...product,
      ...others,
    });

    let variants: ProductVariant[] = [];

    if (productVariants) {
      await validation(productVariants);
      //  prev method
      // product.productVariants?.forEach(variant => {
      //   const curVariant = productDTO.productVariants?.find(({ id }) => variant.id == id?.toString());

      //   if (!curVariant) {
      //     this.productVariantRepository.remove(variant);
      //     product.productVariants = product.productVariants?.filter(curVariant => curVariant.id !== variant.id);
      //   }
      // });
      const removedVariants = product.productVariants?.filter(
        existingVariant => !productDTO.productVariants?.some(newVariant => newVariant.id === existingVariant.id),
      );
      await this.productVariantRepository.remove(removedVariants ?? []);

      variants = product.productVariants;
      //  prev method
      // for (const variantDTO of productDTO.productVariants) {
      //   const variant = await this.productVariantRepository.findOne({
      //     where: {
      //       id: Equal(variantDTO.id),
      //     },
      //   });

      //   if (!variant) {
      //     const variantData = new ProductVariant({ ...(variantDTO as any) });
      //     const newVariant = await this.createProductVariant(variantData, product);
      //     variants.push(newVariant);
      //   }

      //   if (variant) {
      //     await this.productVariantRepository.update(variant.id, { ...variant, ...variantDTO });
      //   }
      // }

      // Update or create variants
      variants = await Promise.all(
        productDTO.productVariants.map(async variantDTO => {
          if (variantDTO.id) {
            await this.productVariantRepository.update(variantDTO.id, variantDTO);

            // SAFER: Add null check to satisfy TypeScript
            const updatedVariant = await this.productVariantRepository.findOneBy({ id: variantDTO.id });
            if (!updatedVariant) {
              throw new Error(`Failed to find variant with ID ${variantDTO.id} after update`);
            }
            return updatedVariant;
          }

          // EXPLICIT CAST: Ensure variantDTO matches ProductVariant type
          return this.createProductVariant(variantDTO as ProductVariant, product);
        }),
      );
    }

    return {
      ...productDTO,
      id: product.id,
      productVariants: variants.map(variant => {
        const { product, ...others } = variant;
        return {
          ...others,
        };
      }),
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

  // async getParameter(id: string): Promise<Parameter> {
  //   const parameter = await this.parameterRepository.findOneOrFail({
  //     where: {
  //       id: Equal(id),
  //     },
  //   });

  //   return parameter;
  // }

  getProductVariantsImages(productVariants?: ProductVariant[]) {
    let images: string[] = [];
    productVariants?.forEach(variant => {
      const variantImages = variant.images ? variant.images.split(', ') : [];
      images = images.concat(variantImages);
    });
    return images;
  }
}
