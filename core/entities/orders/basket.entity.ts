import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderProduct } from './orderProduct.entity';
import { Checkout } from './checkout.entity';

@Entity()
export class Basket {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @OneToMany(() => OrderProduct, orderProduct => orderProduct.inBasket)
  orderProducts: OrderProduct[];

  @OneToOne(() => Checkout, checkout => checkout.basket)
  @JoinColumn()
  checkout: Checkout;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(args?: { title: string, userId: string, orderProducts: OrderProduct[], checkout: Checkout }) {
    if (args) {
      this.userId = args.userId;
      this.orderProducts = args.orderProducts;
      this.checkout = args.checkout;
    }
  }
}
