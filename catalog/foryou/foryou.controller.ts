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
    let productIds: any = [];
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
    await axios(options)
      .then((response: any) => {
        productIds = response.filter(
          (element: any, index: number, array: any) => array.indexOf(element.productId) !== index,
        );
      })
      .catch(err => {
        console.log(err.message);
      });
    if (productIds.length === 0) {
      resp.status(HttpStatus.NOT_FOUND).json({ message: 'reques faild' });
      return;
    }
    try {
      const id = productIds[Math.floor(Math.random() * productIds.length - 1)].productId;
      const product = await this.productService.getProduct(id);
      const queryArray = [product.brand, product.category];

      const query: any = `brands=${queryArray[0]}&categories=${queryArray[1]}`;

      const products = await this.productService.getProducts(query);
      resp.status(HttpStatus.OK).json(products);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }
  // for users with browsing history but no sign in
  @Get('by-history')
  async getForyouByHistory(req: Request, resp: Response) {
    const { history } = req.body;
    if (!history) {
      resp.status(HttpStatus.NO_CONTENT).json({ message: 'No content' });
      return;
    }
    const randomProduct = history[Math.floor(Math.random() * history.length - 1)];
    try {
      const query: any = `brands=${randomProduct.brand}&categories=${randomProduct.category}`;
      const products = await this.productService.getProducts(query);
      resp.status(HttpStatus.OK).json(products);
    } catch (error) {
      resp.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: `somthing went wrong: ${error}` });
    }
  }

  //   for users with signed in state
  @Get('')
  @Middleware([verifyToken, isUser])
  async getForyouByUserId(req: Request, resp: Response) {
    const { jwt } = resp.locals;
    try {
      const history: any = await this.foryouService.getForyou(jwt.id);
      if (!history) {
        resp.status(HttpStatus.NOT_FOUND).json({ message: 'history is empty' });
      }
      const historyBasedProduct: any = [];
      if (history?.productIds.length > 3) {
        history?.productIds.map(async (id: any, index: number) => {
          if (index > 3) return;
          historyBasedProduct.push(await this.productService.getProduct(id));
          // hint: on frontend add most recent viewed product at the start of array
          // arr = ['1','2','6'];
          // arr = ['34', ...arr];
        });
      }
      const randomProduct = history?.productIds[Math.floor(Math.random() * history?.productIds.length - 1)];
      const query: any = `brands=${randomProduct.brand}&categories=${randomProduct.category}`;
      const products = await this.productService.getProducts(query);
      resp.status(HttpStatus.OK).json(historyBasedProduct.concat(products));
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
    try {
      const updated = await this.foryouService.updateForyou(jwt.id, req.body);
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
