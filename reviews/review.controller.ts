import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Review } from '../core/entities';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { ReviewService } from './review.service';
import { Controller, Delete, Get, Post, Put } from '../core/decorators';

@singleton()
@Controller('/reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get()
  async getReviews(req: Request, resp: Response) {
    const reviews = await this.reviewService.getReviews(req.query);

    resp.json(reviews);
  }

  @Get(':id')
  async getReview(req: Request, resp: Response) {
    const { id } = req.params;
    const review = await this.reviewService.getReview(id);

    resp.json(review);
  }

  @Post()
  async createReview(req: Request, resp: Response) {
    const newReview = await validation(new Review(req.body));
    const created = await this.reviewService.createReview(newReview);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateReview(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.reviewService.updateReview(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeReview(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.reviewService.removeReview(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
