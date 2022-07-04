import { singleton } from 'tsyringe';
import { DataSource, Equal, Repository } from 'typeorm';
import { CustomExternalError } from '../../core/domain/error/custom.external.error';
import { ErrorCode } from '../../core/domain/error/error.code';
import { OrderProduct } from '../../core/entities';
import { HttpStatus } from '../../core/lib/http-status';
import axios from 'axios';
import { OrderProductDTO, OrderProductQueryDTO, ProductDTO } from '../order.dtos';

@singleton()
export class OrderProductService {
  private orderProductRepository: Repository<OrderProduct>;

  constructor(dataSource: DataSource) {
    this.orderProductRepository = dataSource.getRepository(OrderProduct);
  }

  async getOrderProducts(queryParams: OrderProductQueryDTO): Promise<OrderProductDTO[]> {
    const {
      productId,
      minQty,
      maxQty,
      minPrice,
      maxPrice,
      sortBy='productId',
      orderBy='DESC',
      limit=10,
    } = queryParams;

    const queryBuilder = this.orderProductRepository
      .createQueryBuilder('orderProduct')
      .leftJoinAndSelect('orderProduct.inBasket', 'basket');

    if (productId) { queryBuilder.andWhere('orderProduct.productId = :productId', {productId: productId}) }
    if (minQty) { queryBuilder.andWhere('orderProduct.qty >= :qty', {qty: minQty}) }
    if (maxQty) { queryBuilder.andWhere('orderProduct.qty <= :qty', {qty: maxQty}) }
    if (minPrice) { queryBuilder.andWhere('orderProduct.productPrice >= :price', {price: minPrice}) }
    if (maxPrice) { queryBuilder.andWhere('orderProduct.productPrice <= :price', {price: maxPrice}) }

    const orderProducts = await queryBuilder
      .orderBy(`orderProduct.${sortBy}`, orderBy)
      .limit(limit)
      .getMany();

    const result = orderProducts.map(async (orderProduct) => await this.mergeOrderProduct(orderProduct))

    return Promise.all(result)
  }

  async getOrderProduct(id: string): Promise<OrderProductDTO> {
    const queryBuilder = await this.orderProductRepository
      .createQueryBuilder('orderProduct')
      .leftJoinAndSelect('orderProduct.inBasket', 'basket')
      .where('orderProduct.id = :id', {id: id})
      .getOne();

    if (!queryBuilder) { throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND) }

    return this.mergeOrderProduct(queryBuilder)
  }

  async getProductById(id: string): Promise<ProductDTO | undefined> {
    try {
      const res = await axios.get(`${process.env.CATALOG_DB}/products/${id}`);

      return res.data;
    } catch (e) {
      console.error(e)
      throw new CustomExternalError([ErrorCode.PRODUCT_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async createOrderProduct(newOrderProduct: OrderProduct): Promise<OrderProduct> {
    const product = await this.getProductById(newOrderProduct.productId);
    newOrderProduct.productPrice = product!.price;

    return this.orderProductRepository.save(newOrderProduct);
  }

  async updateOrderProduct(id: string, orderProductDTO: OrderProduct) {
    try {
      const orderProduct = await this.orderProductRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      const product = await this.getProductById(orderProductDTO.productId);
      orderProductDTO.productPrice = product!.price;

      return this.orderProductRepository.save({
        ...orderProduct,
        ...orderProductDTO
      });
    } catch (e) {
      if (e instanceof CustomExternalError) {
        throw new CustomExternalError(e.messages, e.statusCode)
      }
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async removeOrderProduct(id: string) {
    try {
      await this.orderProductRepository.findOneOrFail({
        where: {
            id: Equal(id),
        }
      });
      return this.orderProductRepository.delete(id);
    } catch {
      throw new CustomExternalError([ErrorCode.ENTITY_NOT_FOUND], HttpStatus.NOT_FOUND);
    }
  }

  async mergeOrderProduct(orderProduct: OrderProduct): Promise<OrderProductDTO> {
    return {
      id: orderProduct.id,
      product: await this.getProductById(orderProduct.productId),
      qty: orderProduct.qty,
      productPrice: orderProduct.productPrice,
      inBasket: orderProduct.inBasket
    }
  }
}
