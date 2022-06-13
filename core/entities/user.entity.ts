import { IsNotEmpty } from 'class-validator';
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

  constructor(args?: { firstName: string, lastName: string, email: string }) {
    if (args) {
      this.firstName = args.firstName;
      this.lastName = args.lastName;
      this.email = args.email;
    }
  }
}
