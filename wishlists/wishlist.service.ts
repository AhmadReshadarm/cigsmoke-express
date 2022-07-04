import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../core/domain/error/custom.external.error';
import { ErrorCode } from '../core/domain/error/error.code';
import { Wishlist } from '../core/entities';
import { HttpStatus } from '../core/lib/http-status';
import { ProductDTO, WishlistDTO, WishlistQueryDTO, UserDTO } from './wishlist.dtos';
import axios from 'axios';
import { scope } from '../core/middlewares/access.user';
import { Role } from '../core/enums/roles.enum';

@singleton()
export class WishlistService {
  private wishlistRepository: Repository<Wishlist>;

  constructor(dataSource: DataSource) {
    this.wishlistRepository = dataSource.getRepository(Wishlist);
  }

  async getWishlists(queryParams: WishlistQueryDTO, authToken: string): Promise<WishlistDTO[]> {
    const { productId, userId, sortBy='productId', orderBy='DESC', limit=10, } = queryParams;

    const queryBuilder = this.wishlistRepository.createQueryBuilder('wishlist');
    if (productId) { queryBuilder.andWhere('wishlist.productId = :productId', { productId: productId }); }
    if (userId) { queryBuilder.andWhere('wishlist.userId = :userId', { userId: userId }); }

    const wishlists = await queryBuilder
      .orderBy(`wishlist.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();

    const result = wishlists.map(async (wishlist) => await this.mergeWishlistUserId(wishlist, authToken))

    return Promise.all(result)
  }

  async getWishlist(id: string, authToken: string): Promise<WishlistDTO> {
    const wishlist = await this.wishlistRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });
    return await this.mergeWishlistUserId(wishlist, authToken)
  }

  async getUserById(id: string, authToken: string): Promise<UserDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.USERS_DB}/users/${id}`, {
        headers: {
          Authorization: authToken!
        }
      });

      return res.data
    } catch (e: any) {
      if (e.name === 'AxiosError' && e.response.status === 403) {
        throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
      }
    }
  }

  async getProductById(id: string): Promise<ProductDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.CATALOG_DB}/products/${id}`);

      return res.data;
    } catch (e: any) {
      if (e.name !== 'AxiosError' && e.response.status !== 404) {
        throw new Error(e)
      }
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
    await this.isUserWishlistOwner(newWishlist, { id: newWishlist.userId, role: Role.User });
    if (!await this.getProductById(newWishlist.productId)) {
      throw new CustomExternalError([ErrorCode.PRODUCT_NOT_FOUND], HttpStatus.NOT_FOUND);
    }

    newWishlist.id = await this.getNewWishlistId()

    return this.wishlistRepository.save(newWishlist);
  }

  async updateWishlist(id: string, wishlistDTO: Wishlist, user: { id: string, role: Role }) {
    const wishlist = await this.wishlistRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    const { productId, ...others } = wishlistDTO;

    const newWishlist = {
      ...wishlist,
      ...others
    }
    await this.isUserWishlistOwner(newWishlist, user);
    await this.wishlistRepository.remove(wishlist);

    return this.wishlistRepository.save(newWishlist)
  }

  async removeWishlist(id: string, user: { id: string, role: Role }) {
    const wishlist = await this.wishlistRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    await this.isUserWishlistOwner(wishlist, user)

    return this.wishlistRepository.remove(wishlist);
  }

  async isUserWishlistOwner(wishlist: Wishlist, user: { id: string, role: Role } ) {
    if (scope(String(wishlist.userId), String(user.id)) && user.role !== Role.Admin) {
      throw new CustomExternalError([ErrorCode.FORBIDDEN], HttpStatus.FORBIDDEN);
    }
  }

  async mergeWishlistUserId(wishlist: Wishlist, authToken: string): Promise<WishlistDTO> {
    return {
      id: wishlist.id,
      product: await this.getProductById(wishlist.productId) ?? wishlist.productId,
      user: await this.getUserById(wishlist.userId, authToken) ?? wishlist.userId,
    }
  }
}
