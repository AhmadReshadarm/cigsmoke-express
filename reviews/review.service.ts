import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { Review } from '../core/entities';
import { HttpStatus } from '../core/lib/http-status';
import { ProductDTO, ReviewDTO, ReviewQueryDTO, UserDTO } from './reviews.dtos';
import axios from 'axios';
import { REVIEW_MAX_RATING, REVIEW_MIN_RATING } from './review.config';


@singleton()
export class ReviewService {
  private reviewRepository: Repository<Review>;

  constructor(dataSource: DataSource) {
    this.reviewRepository = dataSource.getRepository(Review);
  }

  async getReviews(queryParams: ReviewQueryDTO): Promise<ReviewDTO[]> {
    const { productId, userId, sortBy='productId', orderBy='DESC', limit=10, } = queryParams;

    const queryBuilder = this.reviewRepository.createQueryBuilder('review');
    if (productId) { queryBuilder.andWhere('review.productId = :productId', { productId: productId }); }
    if (userId) { queryBuilder.andWhere('review.userId = :userId', { userId: userId }); }

    const reviews = await queryBuilder
      .orderBy(`review.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();

    const result = reviews.map(async (review) => await this.mergeReviewUserId(review))

    return Promise.all(result)
  }

  async getReview(id: string): Promise<ReviewDTO> {
    try {
      const review = await this.reviewRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
    });
      return await this.mergeReviewUserId(review)
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getUserById(id: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`);

      return res.data
    } catch (e) {
      console.error(e)
      throw new CustomExternalError([ErrorCode.USER_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getProductById(id: string): Promise<ProductDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.CATALOG_DB}/products/${id}`);

      return res.data;
    } catch (e) {
      console.error(e)
      throw new CustomExternalError([ErrorCode.PRODUCT_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getNewReviewId(): Promise<string> {
    const lastElement =  await this.reviewRepository.find( {
      order: { id: 'DESC' },
      take: 1
    })

    return lastElement[0]? String(+lastElement[0].id + 1) : String(1);
  }

  async createReview(newReview: Review): Promise<Review> {
    await this.validateReview(newReview);
    newReview.id = await this.getNewReviewId()

    return this.reviewRepository.save(newReview);
  }

  async updateReview(id: string, reviewDTO: Review) {
    try {
      const review = await this.reviewRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });

      await this.validateReview(reviewDTO);
      const newReview = {
        ...review,
        ...reviewDTO
      }

      return this.reviewRepository
        .createQueryBuilder()
        .update('review')
        .set(newReview)
        .where('productId = :productId', {productId: review.productId})
        .andWhere('userId = :userId', {userId: review.userId})
        .execute()
    } catch (e) {
      if (e instanceof CustomExternalError) {
        throw new CustomExternalError(e.messages, e.statusCode)
      }
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeReview(id: string) {
    try {
      const review = await this.reviewRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.reviewRepository.remove(review);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async validateReview(review: Review) {
    await this.getUserById(review.userId);
    await this.getProductById(review.productId)

    if (review.rating > REVIEW_MAX_RATING) {
      throw new CustomExternalError([`${ErrorCode.RATING_CANNOT_BE_GT}:${REVIEW_MAX_RATING}`], HttpStatus.BAD_REQUEST);
    }
    if (review.rating < REVIEW_MIN_RATING) {
      throw new CustomExternalError([`${ErrorCode.RATING_CANNOT_BE_LT}:${REVIEW_MIN_RATING}`], HttpStatus.BAD_REQUEST);
    }
  }

  async mergeReviewUserId(review: Review): Promise<ReviewDTO> {
    return {
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      product: await this.getProductById(review.productId),
      user: await this.getUserById(review.userId),
    }
  }
}
