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
import { BasketStatus } from '../../enums/basket-status.enum';

@Entity()
export class Basket {
  @PrimaryGeneratedColumn()
  id: string;

  @Column( {nullable: true})
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

  @Column({ type: 'enum', enum: BasketStatus, default: BasketStatus.New })
  status: BasketStatus

  constructor(args?: { title: string, orderProducts: OrderProduct[], checkout: Checkout, status: BasketStatus }) {
    if (args) {
      this.orderProducts = args.orderProducts;
      this.checkout = args.checkout;
      this.status = args.status;
    }
  }
}
