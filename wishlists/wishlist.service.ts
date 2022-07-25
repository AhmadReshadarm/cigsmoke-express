import axios from 'axios';
import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { Wishlist, WishlistProduct } from '../core/entities';
import { WishlistProductService } from './wishlist-product.service';
import { ProductDTO, WishlistQueryDTO } from './wishlist.dtos';
import { PaginationDTO } from '../core/lib/dto';

@singleton()
export class WishlistService {
  private wishlistRepository: Repository<Wishlist>;
  private wishlistProductRepository: Repository<WishlistProduct>;

  constructor(
    dataSource: DataSource,
    private wishlistProductService: WishlistProductService
  ) {
    this.wishlistRepository = dataSource.getRepository(Wishlist);
    this.wishlistProductRepository = dataSource.getRepository(WishlistProduct);
  }

  async getWishlists(queryParams: WishlistQueryDTO): Promise<PaginationDTO<Wishlist>> {
    const { sortBy = 'productId', orderBy = 'DESC', limit = 10, offset = 0 } = queryParams;

    const queryBuilder = this.wishlistRepository.createQueryBuilder('wishlist');

    const wishlists = await queryBuilder
      .orderBy(`wishlist.${sortBy}`, orderBy)
      .skip(offset)
      .take(limit)
      .getMany();

    return  {
      rows: wishlists,
      length: await this.wishlistRepository.count(),
    }
  }

  async getWishlist(id: string): Promise<Wishlist> {
    const wishlist = await this.wishlistRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
      relations: ['items']
    });

    return wishlist;
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

  async createWishlist(): Promise<Wishlist> {
    const wishlist = new Wishlist({ items: [] });

    return this.wishlistRepository.save(wishlist);
  }

  async updateWishlist(id: string, whishlistDTO: Wishlist) {
    const wishlist = await this.wishlistRepository.findOneOrFail({
      where: {
        id: Equal(id),
      },
      relations: ['items'],
    });

    wishlist.items.forEach(item => {
      const curWishlistProduct = whishlistDTO.items.find(({ productId }) => item.productId === productId.toString());

      if (!curWishlistProduct) {
        this.wishlistProductRepository.remove(item);
        wishlist.items = wishlist.items.filter(curItem => curItem.id !== item.id)
      }
    });

    const items = [...wishlist.items]

    for (const { productId } of whishlistDTO.items) {
      const wishlistProduct = await this.wishlistProductRepository.findOne({
        where: {
          productId: Equal(productId),
          wishlist: Equal(wishlist.id),
        },
      });

      if (!wishlistProduct) {
        const wishlistProductData = new WishlistProduct({ productId, wishlist });
        const newWishlistProduct = await this.wishlistProductService.createWishlistProduct(wishlistProductData);
        items.push(newWishlistProduct);
      }
    }

    return {
      ...wishlist,
      items,
    }
  }

  async removeWishlist(id: string) {
    const wishlist = await this.wishlistRepository.findOneOrFail({
      where: {
        id: Equal(id),
      }
    });

    return this.wishlistRepository.remove(wishlist);
  }
}
