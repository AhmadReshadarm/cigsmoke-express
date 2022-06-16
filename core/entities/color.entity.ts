import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Color {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Product, (product) => product.colors)
  products?: Product[]

  constructor(args?: { name: string, products?: Product[] }) {
    if (args) {
      this.name = args.name;
      this.products = args.products;
    }
  }
}
