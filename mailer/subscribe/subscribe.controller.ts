import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { SubsribeService } from './subsribe.service';
import { Controller, Delete, Get, Middleware, Post } from '../../core/decorators';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { Subscribe } from '../../core/entities';
import { isAdmin, verifyToken } from '../../core/middlewares';


@singleton()
@Controller('/subscribes')
export class SubscribeController {
  constructor(private subscribeService: SubsribeService) {}

  @Get()
  @Middleware([verifyToken, isAdmin])
  async getSubscribers(req: Request, resp: Response) {
    const subscribes = await this.subscribeService.getSubscribers()

    resp.status(HttpStatus.OK).json(subscribes);
  }

  @Post('')
  async subscribe(req: Request, resp: Response) {
    const newSubscribe = new Subscribe(req.body);
    await validation(newSubscribe);

    const created = await this.subscribeService.createSubscribe(newSubscribe)

    resp.status(HttpStatus.OK).json(created);
  }

  @Delete(':mail')
  async unsubscribe(req: Request, resp: Response) {
    const { mail } = req.params
    const removed = await this.subscribeService.removeSubscribe(mail);

    resp.status(HttpStatus.OK).json(removed);
  }
}
