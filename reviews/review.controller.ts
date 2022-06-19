import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { Review } from '../core/entities/review.entity';
import { asyncHandler } from '../core/lib/error.handlers';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { ReviewService } from './review.service';
import { ReviewDTO } from './reviews.dtos';

@singleton()
export class ReviewController {
  readonly routes = Router();

  constructor(private reviewService: ReviewService) {
    this.routes.get('/reviews', this.getReviews);
    this.routes.get('/reviews/:id', this.getReview);
    this.routes.post('/reviews', this.createReview);
    this.routes.put('/reviews/:id', this.updateReview);
    this.routes.delete('/reviews/:id', this.removeReview);
  }

  private getReviews = asyncHandler(async (req: Request, resp: Response) => {
    const reviews = await this.reviewService.getReviews();
    console.log(reviews);

    resp.json(reviews);
  });

  private getReview = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const review = await this.reviewService.getReview(id);

    resp.json(review);
  });

  private createReview = asyncHandler(async (req: Request, resp: Response) => {
    const newReview = await validation(new Review(req.body));
    const created = await this.reviewService.createReview(newReview);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateReview = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.reviewService.updateReview(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeReview = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.reviewService.removeReview(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
