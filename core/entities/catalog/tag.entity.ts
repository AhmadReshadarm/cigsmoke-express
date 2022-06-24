import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Product, (product) => product.tags)
  products?: Product[];

  @Column()
  url: string;

  constructor(args?: { name: string, products?: Product[], url: string }) {
    if (args) {
      this.name = args.name;
      this.products = args.products;
      this.url = args.url;
    }
  }
}
