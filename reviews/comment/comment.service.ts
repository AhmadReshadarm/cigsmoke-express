import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { Comment, Review } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import { CommentQueryDTO, UserAuth, UserDTO, CommentDTO, CreateCommentDTO } from '../reviews.dtos';
import axios from 'axios';
import { scope } from '../../core/middlewares/access.user';
import { Role } from '../../core/enums/roles.enum';
import { PaginationDTO } from '../../core/lib/dto';


@singleton()
export class CommentService {
  private commentRepository: Repository<Comment>;
  private reviewRepository: Repository<Review>;

  constructor(dataSource: DataSource) {
    this.commentRepository = dataSource.getRepository(Comment);
    this.reviewRepository = dataSource.getRepository(Review);
  }

  async getComments(queryParams: CommentQueryDTO): Promise<PaginationDTO<CommentDTO>> {
    const {
      userId,
      orderBy = 'DESC',
      offset = 0,
      limit = 10,
    } = queryParams;

    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.review', 'review', 'review.productId = comment.reviewProductId and review.userId = comment.reviewUserId');

    if (userId) { queryBuilder.andWhere('comment.userId = :userId', { userId: userId }); }

    queryBuilder
      .orderBy(`comment.userId`, orderBy)
      .skip(offset)
      .take(limit)

    const comments = await queryBuilder.getMany();
    const result = comments.map(async (comment) => await this.mergeCommentUserId(comment, ''))


    return  {
      rows: await Promise.all(result),
      length: await queryBuilder.getCount(),
    }
  }

  async getComment(id: string, authToken: string): Promise<CommentDTO> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.review', 'review', 'review.productId = comment.reviewProductId and review.userId = comment.reviewUserId')
      .where('comment.id = :id', { id: id })
      .getOneOrFail()

    return await this.mergeCommentUserId(comment, authToken)
  }

  async getUserById(id: string, authToken: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`, {
        headers: {
          Authorization: authToken!
        }
      });

      return res.data
    } catch (e: any) {
      if (e.name === 'AxiosError' && e.response.status === 403) {
        throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
      }
    }
  }


  async getReview(id: string) {
    return this.reviewRepository.findOneOrFail({
      where: {
        id: Equal(id)
      }
    })
  }

  async createComment(commentDTO: CreateCommentDTO): Promise<Comment> {
    await this.validation(commentDTO)
    const review = await this.getReview(commentDTO.reviewId)

    const newComment = new Comment({
      userId: commentDTO.userId,
      review: review,
      text: commentDTO.text
    })

    return this.commentRepository.save(newComment);
  }

  async updateComment(id: string, commentDTO: CreateCommentDTO, user: UserAuth, authToken: string) {
    const comment = await this.getComment(id, authToken)
    const { reviewId, ...others } = commentDTO;

    const newComment = {
      ...comment,
      ...others
    }

    newComment.userId = typeof comment.user === 'string' ? comment.user : comment.user.id;

    await this.isUserCommentOwner(newComment, user);
    await this.commentRepository.remove(comment as any);

    return this.commentRepository.save(newComment)
  }

  async removeComment(id: string, user: UserAuth) {
    const comment = await this.commentRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    await this.isUserCommentOwner(comment, user)

    return this.commentRepository.remove(comment);
  }

  isUserCommentOwner(comment: Comment, user: UserAuth) {
    if (scope(String(comment.userId), String(user.id)) && user.role !== Role.Admin) {
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }
  }

  validation(newComment: CreateCommentDTO) {
    if (!newComment.userId || !newComment.reviewId || !newComment.text) {
      throw new CustomExternalError([ErrorCode.VALIDATION_COMMENTS], HttpStatus.BAD_REQUEST)
    }
  }

  async mergeCommentUserId(comment: Comment, authToken: string): Promise<CommentDTO> {
    return {
      id: comment.id,
      user: await this.getUserById(comment.userId, authToken) ?? comment.userId,
      review: comment.review,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }
  }
}
