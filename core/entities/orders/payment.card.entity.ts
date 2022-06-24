import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Checkout } from './checkout.entity';

@Entity()
export class PaymentCard {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  cardNumber: string;

  @Column()
  expirationMonth: number;

  @Column()
  expirationYear: number;

  @Column()
  cardholder: string;

  @OneToMany(() => Checkout, checkout => checkout.payment)
  checkouts: Checkout[];

  constructor(args?: {userId: string, cardNumber: string, expirationMonth: number, expirationYear: number, cardholder: string }) {
    if (args) {
      this.userId = args.userId;
      this.cardNumber = args.cardNumber
      this.expirationMonth = args.expirationMonth;
      this.expirationYear = args.expirationYear;
      this.cardholder = args.cardholder;
    }
  }
}
