import { IsEmpty, IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @Column()
  @IsNotEmpty()
  email: string;

  @Column()
  // @IsNotEmpty() TODO validation requires to accept hashed password
  password: string;

  @Column()
  adminSecret: string;

  @Column('boolean', { default: false })
  isVerified: boolean = false;

  constructor(args?: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    isVerified: boolean;
    adminSecret: string;
  }) {
    if (args) {
      this.firstName = args.firstName;
      this.lastName = args.lastName;
      this.email = args.email;
      this.isVerified = args.isVerified;
      this.adminSecret = args.adminSecret;
    }
  }
}
