import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Color {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column()
  name: string;

  @ManyToMany(() => Product, product => product.colors)
  products?: Product[];

  @IsNotEmpty()
  @Column({ unique: true })
  url: string;

  @IsNotEmpty()
  @Column()
  code: string;

  constructor(args?: { name: string; products?: Product[]; url: string; code: string }) {
    if (args) {
      this.name = args.name;
      this.products = args.products;
      this.url = args.url;
      this.code = args.code;
    }
  }
}
