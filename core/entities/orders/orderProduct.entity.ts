import { Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Basket } from './basket.entity';
import { IsNotEmpty, Min } from 'class-validator';

@Entity()
export class OrderProduct {
  @Column({unique: true})
  id: string;

  @IsNotEmpty()
  @Column()
  userId: string;

  @IsNotEmpty()
  @PrimaryColumn()
  productId: string;

  @IsNotEmpty()
  @Min(1)
  @Column()
  qty: number;

  @Column()
  productPrice: number;

  @IsNotEmpty()
  @PrimaryColumn( { nullable: false })
  basketId: string;

  @IsNotEmpty()
  @ManyToOne(() => Basket, basket => basket.orderProducts, { nullable: false })
  inBasket: Basket

  constructor(args?: { title: string, productId: string, qty: number, inBasket: Basket }) {
    if (args) {
      this.productId = args.productId;
      this.qty = args.qty;
      this.inBasket = args.inBasket;
    }
  }
}
