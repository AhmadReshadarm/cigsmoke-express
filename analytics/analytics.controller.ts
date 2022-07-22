import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { AnalyticsService } from './analytics.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../core/decorators';
import { isAdmin, isUser, verifyToken, verifyUserId } from '../core/middlewares';

@singleton()
@Controller('/analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('')
  @Middleware([verifyToken, isAdmin])
  async getAnalytics(req: Request, resp: Response) {
    const analytics = await this.analyticsService.getAnalytics(req.query, req.headers.authorization!);

    resp.json(analytics);
  }

  // @Get('products')
  // @Middleware([verifyToken, isAdmin])
  // async getAnalyticsGroupByProducts(req: Request, resp: Response) {
  //   const analytics = await this.analyticsService.getAnalyticsGroupByProducts(req.query, req.headers.authorization!);
  //
  //   resp.json(analytics);
  // }
  //
  // @Get('users')
  // @Middleware([verifyToken, isAdmin])
  // async getAnalyticsGroupByUsers(req: Request, resp: Response) {
  //   const analytics = await this.analyticsService.getAnalyticsGroupByUsers(req.query, req.headers.authorization!);
  //
  //   resp.json(analytics);
  // }
  //
  // @Get('brands')
  // @Middleware([verifyToken, isAdmin])
  // async getAnalyticsGroupByBrands(req: Request, resp: Response) {
  //   const analytics = await this.analyticsService.getAnalyticsGroupByBrands(req.query, req.headers.authorization!);
  //
  //   resp.json(analytics);
  // }
  //
  // @Get('categories')
  // @Middleware([verifyToken, isAdmin])
  // async getAnalyticsGroupByCategories(req: Request, resp: Response) {
  //   const analytics = await this.analyticsService.getAnalyticsGroupByCategories(req.query, req.headers.authorization!);
  //
  //   resp.json(analytics);
  // }

  @Get('dynamic')
  @Middleware([verifyToken, isAdmin])
  async getDynamic(req: Request, resp: Response) {
    const analytics = await this.analyticsService.getDynamic(req.query, req.headers.authorization!);

    resp.json(analytics);
  }
}
