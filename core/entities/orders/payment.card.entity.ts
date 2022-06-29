import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Checkout } from './checkout.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class PaymentCard {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column()
  userId: string;

  @IsNotEmpty()
  @Column()
  cardNumber: string;

  @IsNotEmpty()
  @Column()
  expirationMonth: number;

  @IsNotEmpty()
  @Column()
  expirationYear: number;

  @IsNotEmpty()
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
