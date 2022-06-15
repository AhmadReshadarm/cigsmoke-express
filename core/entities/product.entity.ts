import { IsNotEmpty } from 'class-validator';
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
  available: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Color)
  @JoinTable()
  colors: Color[];

  @ManyToOne(() => Category, category => category.id)
  category: Category;

  @Column({ nullable: true })
  images: string;

  @ManyToOne(() => Brand, brand => brand.id)
  brand: Brand;

  @Column()
  url: string;

  constructor(args?: { name: string, price: number, desc: string, available: string, colors: Color[], category: Category, images: string, url: string }) {
    if (args) {
      this.name = args.name;
      this.price = args.price;
      this.desc = args.desc;
      this.available = args.available;
      this.colors = args.colors;
      this.category = args.category;
      this.images = args.images;
      this.url = args.url;
    }
  }
}
