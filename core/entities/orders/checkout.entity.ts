import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';
import { PaymentCard } from './payment.card.entity';
import { Basket } from './basket.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Checkout {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @IsNotEmpty()
  @ManyToOne(() => Address, address => address.checkouts)
  address: Address;

  @IsNotEmpty()
  @ManyToOne(() => PaymentCard, paymentCard => paymentCard.checkouts)
  payment: PaymentCard;

  @IsNotEmpty()
  @OneToOne(() => Basket, basket => basket.checkout)
  @JoinColumn()
  basket: Basket;

  @Column({ nullable: true })
  comment: string;

  constructor(args?: { address: Address, payment: PaymentCard, basket: Basket, comment: string }) {
    if (args) {
      this.address = args.address;
      this.payment = args.payment;
      this.basket = args.basket;
      this.comment = args.comment;
    }
  }
}
