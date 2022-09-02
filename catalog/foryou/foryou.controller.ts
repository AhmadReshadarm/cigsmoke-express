import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { HttpStatus } from '../../core/lib/http-status';
import { validation } from '../../core/lib/validator';
import { ForyouService } from './foryou.service';
import { ProductService } from '../products/product.service';
import { Foryou } from '../../core/entities';
import { Controller, Delete, Get, Middleware, Post, Put } from '../../core/decorators';
import { isAdmin, verifyToken, isUser } from '../../core/middlewares';
import axios from 'axios';

@singleton()
@Controller('/foryou')
export class ForyouController {
  constructor(private foryouService: ForyouService, private productService: ProductService) {}

  @Get('anonymous')
  async getForyouAnonymous(req: Request, resp: Response) {
    const options = {
      url: `${process.env.ORDERS_DB}/order-products/inner`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      data: {
        secretKey: process.env.INNER_SECRET_KEY,
      },
    };

    try {
      const response = await axios(options);
      const ids = response.data.filter(
        (element: any, index: number, array: any) => array.indexOf(element.productId) !== index,
      );
      if (ids.length === 0) {
        resp.status(HttpStatus.NOT_FOUND).json({ message: 'request faild' });
        return;
      }
      const id = ids[Math.floor(Math.random() * ids.length - 1)];
      const product = this.productService.getProduct(id);
      resp.status(HttpStatus.OK).json(product);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Get('')
  @Middleware([verifyToken, isUser])
  async getForyouByUserId(req: Request, resp: Response) {
    const { jwt } = resp.locals;
    try {
      const history: any = await this.foryouService.getForyou(jwt.id);
      if (!history) {
        resp.status(HttpStatus.NOT_FOUND).json({ message: 'history is empty' });
      }
      resp.status(HttpStatus.OK).json(history.productId);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Post('')
  @Middleware([verifyToken, isUser])
  async createProduct(req: Request, resp: Response) {
    const { jwt } = resp.locals;
    const { history } = req.body;
    if (!history) {
      resp.status(HttpStatus.NO_CONTENT).json({ message: 'No content' });
      return;
    }
    try {
      const newHistory = await validation(new Foryou(req.body));
      newHistory.userId = jwt.id;
      const created = await this.foryouService.createForyou(newHistory);

      resp.status(HttpStatus.CREATED).json({ id: created.id });
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Put('')
  @Middleware([verifyToken, isUser])
  async updateProduct(req: Request, resp: Response) {
    const { jwt } = resp.locals;
    const { history } = req.body;
    if (!req.body.history) {
      resp.status(HttpStatus.BAD_REQUEST).json({ message: 'history not found' });
      return;
    }
    try {
      const newHistroy: any = [];
      history.map(async (ids: any) => {
        const isConflict = await this.foryouService.getProductId(ids);
        if (!isConflict) {
          newHistroy.push(ids);
        }
      });
      if (newHistroy.length == 0) {
        resp.status(HttpStatus.NOT_ACCEPTABLE).json({ message: 'no new history' });
        return;
      }
      const updated = await this.foryouService.updateForyou(jwt.id, { id: '', userId: jwt.id, productIds: newHistroy });
      resp.status(HttpStatus.OK).json(updated.id);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Get('admin')
  @Middleware([verifyToken, isAdmin])
  async getHistoriesAdmin(req: Request, resp: Response) {
    try {
      const histories = await this.foryouService.getForyous();
      resp.status(HttpStatus.OK).json(histories);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Get('admin/:id')
  @Middleware([verifyToken, isAdmin])
  async getHistoryAdmin(req: Request, resp: Response) {
    const { id } = req.params;
    try {
      const history = await this.foryouService.getForyou(id);
      const userHistory: any = [];
      history?.productIds.map(async (id: any) => {
        userHistory.push(await this.productService.getProduct(id));
      });
      resp.status(HttpStatus.OK).json(userHistory);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  @Delete(':id')
  @Middleware([verifyToken, isAdmin])
  async removeProduct(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.foryouService.removeForyou(id);
    resp.status(HttpStatus.OK).json(removed);
  }
}
