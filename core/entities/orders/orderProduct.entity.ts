import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Basket } from './basket.entity';

@Entity()
export class OrderProduct {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  productId: string;

  @Column()
  qty: number;

  @Column()
  productPrice: number

  @ManyToOne(() => Basket, basket => basket.orderProducts, {nullable: false})
  inBasket: Basket

  constructor(args?: { title: string, productId: string, qty: number, inBasket: Basket }) {
    if (args) {
      this.productId = args.productId;
      this.qty = args.qty;
      this.inBasket = args.inBasket;
    }
  }
}
