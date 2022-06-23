import { Request, Response } from 'express';
import { singleton } from 'tsyringe';
import { Wishlist } from '../core/entities/wishlist/wishlist.entity';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { WishlistService } from './wishlist.service';
import { Controller, Delete, Get, Post, Put } from '../core/decorators';

@singleton()
@Controller('/wishlists')
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  async getWishlists(req: Request, resp: Response) {
    const wishlists = await this.wishlistService.getWishlists(req.query);

    resp.json(wishlists);
  }

  @Get(':id')
  async getWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const wishlist = await this.wishlistService.getWishlist(id);

    resp.json(wishlist);
  }

  @Post()
  async createWishlist(req: Request, resp: Response) {
    const newWishlist = await validation(new Wishlist(req.body));
    const created = await this.wishlistService.createWishlist(newWishlist);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  }

  @Put(':id')
  async updateWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const updated = await this.wishlistService.updateWishlist(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  }

  @Delete(':id')
  async removeWishlist(req: Request, resp: Response) {
    const { id } = req.params;
    const removed = await this.wishlistService.removeWishlist(id);

    resp.status(HttpStatus.OK).json(removed);
  }
}
