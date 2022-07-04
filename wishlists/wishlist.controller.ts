import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Wishlist } from '../core/entities';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { WishlistService } from './wishlist.service';
import { Controller, Delete, Get, Middleware, Post, Put } from '../core/decorators';
import { isUser, verifyToken, verifyUserId } from '../core/middlewares';
import { Role } from '../core/enums/roles.enum';

@singleton()
@Controller('/wishlists')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  @Middleware([verifyToken, isUser])
  async getWishlists(req: Request, resp: Response) {
    if (resp.locals.user.role !== Role.Admin) {
      req.query.userId = String(resp.locals.user.id);
    }

    const wishlists = await this.wishlistService.getWishlists(req.query, req.headers.authorization!);

    resp.json(wishlists);
  }

  @Get(':id')
  @Middleware([verifyToken, isUser])
  async getWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const wishlist = await this.wishlistService.getWishlist(id, req.headers.authorization!);

    resp.json(wishlist);
  }

  @Post()
  @Middleware([verifyToken, isUser])
  async createWishlist(req: Request, resp: Response) {
    const newWishlist = new Wishlist(req.body);
    newWishlist.userId = resp.locals.user.id;

    await validation(newWishlist);
    const created = await this.wishlistService.createWishlist(newWishlist);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  @Middleware([verifyToken, isUser])
  async updateWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.wishlistService.updateWishlist(id, req.body, resp.locals.user);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  @Middleware([verifyToken, isUser])
  async removeWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.wishlistService.removeWishlist(id, resp.locals.user);

    resp.status(HttpStatus.OK).json(removed);
  }
}
