import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Checkout } from './checkout.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @IsNotEmpty()
  @Column()
  fistName: string;

  @IsNotEmpty()
  @Column()
  lastName: string;

  @IsNotEmpty()
  @Column()
  address: string;

  @IsNotEmpty()
  @Column()
  city: string;

  @IsNotEmpty()
  @Column()
  country: string;

  @IsNotEmpty()
  @Column()
  zipCode: string;

  @OneToMany(() => Checkout, checkout => checkout.address)
  checkouts: Checkout[];

  constructor(args?: { fistName: string, lastName: string, address: string, city: string, country: string, zipCode: string }) {
    if (args) {
      this.fistName = args.fistName
      this.lastName = args.lastName
      this.address = args.address;
      this.city = args.city;
      this.country = args.country;
      this.zipCode = args.zipCode;
    }
  }
}
