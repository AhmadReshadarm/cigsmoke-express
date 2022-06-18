import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Color } from './color.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  desc: string;

  @Column()
  available: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(
    () => Color,
    (color) => color.products,
    { cascade: true, nullable: false },
  )
  @JoinTable()
  colors?: Color[];

  @ManyToOne(() => Category, category => category.id, { nullable: false })
  category: Category;

  @Column({ nullable: true })
  images: string;

  @ManyToOne(() => Brand, brand => brand.id, { nullable: false })
  brand: Brand;

  @Column({unique: true})
  url: string;

  constructor(args?: { name: string, price: number, desc: string, available: boolean, colors?: Color[], category: Category, images: string, url: string, brand: Brand}) {
    if (args) {
      this.name = args.name;
      this.price = args.price;
      this.desc = args.desc;
      this.available = args.available;
      this.colors = args.colors;
      this.category = args.category;
      this.images = args.images;
      this.url = args.url;
      this.brand = args.brand;
    }
  }
}
