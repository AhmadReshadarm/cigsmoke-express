import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from './address.entity';
import { Basket } from './basket.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Checkout {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  paymentId: string;

  @Column()
  userId: string;

  @IsNotEmpty()
  @ManyToOne(() => Address, address => address.checkouts, { cascade: true, onDelete: 'SET NULL' })
  address: Address;

  @IsNotEmpty()
  @OneToOne(() => Basket, basket => basket.checkout, { cascade: true, onDelete: 'SET NULL' })
  @JoinColumn()
  basket: Basket;

  @Column('text', { nullable: true })
  comment: string;

  @Column()
  leaveNearDoor: boolean;

  constructor(args?: { paymentId: string; address: Address; basket: Basket; comment: string; leaveNearDoor: boolean }) {
    if (args) {
      this.paymentId = args.paymentId;
      this.address = args.address;
      this.basket = args.basket;
      this.comment = args.comment;
      this.leaveNearDoor = args.leaveNearDoor;
    }
  }
}
