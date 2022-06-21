import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Checkout } from './checkout.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @Column()
  fistName: string;

  @Column()
  lastName: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  zipCode: string;

  @OneToMany(() => Checkout, checkout => checkout.address)
  checkouts: Checkout[];

  constructor(args?: {userId: string, fistName: string, lastName: string, address: string, city: string, country: string, zipCode: string }) {
    if (args) {
      this.userId = args.userId;
      this.fistName = args.fistName
      this.lastName = args.lastName
      this.address = args.address;
      this.city = args.city;
      this.country = args.country;
      this.zipCode = args.zipCode;
    }
  }
}
