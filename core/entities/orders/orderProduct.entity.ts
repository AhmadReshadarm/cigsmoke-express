import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Basket } from './basket.entity';
import { IsNotEmpty, Min } from 'class-validator';

@Entity()
export class OrderProduct {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column()
  productId: string;

  @IsNotEmpty()
  @Min(1)
  @Column()
  qty: number;

  @Column()
  productPrice: number

  @IsNotEmpty()
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
