import { Request, Response, Router } from 'express';
import { singleton } from 'tsyringe';
import { Wishlist } from '../core/entities/wishlist/wishlist.entity';
import { asyncHandler } from '../core/lib/error.handlers';
import { HttpStatus } from '../core/lib/http-status';
import { validation } from '../core/lib/validator';
import { WishlistService } from './wishlist.service';
import { WishlistDTO } from './wishlist.dtos';


@singleton()
export class WishlistController {
  readonly routes = Router();

  constructor(private wishlistService: WishlistService) {
    this.routes.get('/wishlists', this.getWishlists);
    this.routes.get('/wishlists/:id', this.getWishlist);
    this.routes.post('/wishlists', this.createWishlist);
    this.routes.put('/wishlists/:id', this.updateWishlist);
    this.routes.delete('/wishlists/:id', this.removeWishlist);
  }

  private getWishlists = asyncHandler(async (req: Request, resp: Response) => {
    const wishlists = await this.wishlistService.getWishlists(req.query);

    resp.json(wishlists);
  });

  private getWishlist = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const wishlist = await this.wishlistService.getWishlist(id);

    resp.json(wishlist);
  });

  private createWishlist = asyncHandler(async (req: Request, resp: Response) => {
    const newWishlist = await validation(new Wishlist(req.body));
    const created = await this.wishlistService.createWishlist(newWishlist);

    resp.status(HttpStatus.CREATED).json({ id: created.id });
  });

  private updateWishlist = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const updated = await this.wishlistService.updateWishlist(id, req.body);

    resp.status(HttpStatus.OK).json(updated);
  });

  private removeWishlist = asyncHandler(async (req: Request, resp: Response) => {
    const { id } = req.params;
    const removed = await this.wishlistService.removeWishlist(id);

    resp.status(HttpStatus.OK).json(removed);
  });
}
