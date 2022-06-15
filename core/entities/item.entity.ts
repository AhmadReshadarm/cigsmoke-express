import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  @IsNotEmpty()
  name: string;

  @Column()
  @IsNotEmpty()
  price: number;

  @Column()
  desc: string;


  constructor(args?: { name: string, price: number, desc: string }) {
    if (args) {
      this.name = args.name;
      this.price = args.price;
      this.desc = args.desc;
    }
  }
}
