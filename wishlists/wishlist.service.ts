import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { Wishlist } from '../core/entities';
import { HttpStatus } from '../core/lib/http-status';
import { ProductDTO, WishlistDTO, UserDTO, WishlistQueryDTO } from './wishlist.dtos';
import axios from 'axios';


@singleton()
export class WishlistService {
  private wishlistRepository: Repository<Wishlist>;

  constructor(dataSource: DataSource) {
    this.wishlistRepository = dataSource.getRepository(Wishlist);
  }

  async getWishlists(queryParams: WishlistQueryDTO): Promise<any> {
    const { productId, userId, sortBy='productId', orderBy='DESC', limit=10, } = queryParams;

    const queryBuilder = this.wishlistRepository.createQueryBuilder("wishlist");
    if (productId) { queryBuilder.andWhere('wishlist.productId = :productId', { productId: productId }); }
    if (userId) { queryBuilder.andWhere('wishlist.userId = :userId', { userId: userId }); }

    const wishlists = await queryBuilder
      .orderBy(`wishlist.${sortBy}`, orderBy)
      .limit(limit)
      .getMany()

    const result = wishlists.map(async (wishlist) => await this.mergeWishlistUserProduct(wishlist));

    return Promise.all(result)
  }

  async getWishlist(id: string): Promise<WishlistDTO> {
    try {
      const wishlist = await this.wishlistRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
    });

      return await this.mergeWishlistUserProduct(wishlist)
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getUserById(id: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/notAdmin/${id}`);

      return res.data
    } catch {
      throw new CustomExternalError([ErrorCode.USER_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getProductById(id: string): Promise<ProductDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.CATALOG_DB}/products/${id}`);

      return res.data;
    } catch {
      throw new CustomExternalError([ErrorCode.PRODUCT_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async getNewWishlistId(): Promise<string> {
    const lastElement =  await this.wishlistRepository.find( {
      order: { id: 'DESC' },
      take: 1
    })

    return lastElement[0]? String(+lastElement[0].id + 1) : String(1);
  }

  async createWishlist(newWishlist: Wishlist): Promise<Wishlist> {
    await this.validateWishlist(newWishlist);
    newWishlist.id = await this.getNewWishlistId()

    return this.wishlistRepository.save(newWishlist);
  }

  async updateWishlist(id: string, wishlistDTO: Wishlist) {
    try {
      const wishlist = await this.wishlistRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });

      await this.validateWishlist(wishlistDTO);
      const newWishlist = {
        ...wishlist,
        ...wishlistDTO
      }

      await this.wishlistRepository.remove(wishlist);

      return this.wishlistRepository.save(newWishlist)
    } catch (e) {
      if (e instanceof CustomExternalError) {
        throw new CustomExternalError(e.messages, e.statusCode)
      }
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeWishlist(id: string) {
    try {
      const wishlist = await this.wishlistRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.wishlistRepository.remove(wishlist);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async validateWishlist(wishlist: Wishlist) {
    await this.getUserById(wishlist.userId);
    await this.getProductById(wishlist.productId)
  }

  async mergeWishlistUserProduct(wishlist: Wishlist): Promise<WishlistDTO> {
    return {
      id: wishlist.id,
      product: await this.getProductById(wishlist.productId),
      user: await this.getUserById(wishlist.userId),
    }
  }
}
