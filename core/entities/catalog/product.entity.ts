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
import { IsNotEmpty, Min } from 'class-validator';
import { Tag } from './tag.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column()
  name: string;

  @IsNotEmpty()
  @Column()
  @Min(1)
  price: number;

  @Column()
  @Min(1)
  oldPrice: number;

  @Column({ nullable: true })
  desc: string;

  @IsNotEmpty()
  @Column()
  available: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @IsNotEmpty()
  @ManyToMany(
    () => Color,
    (color) => color.products,
    { cascade: true, nullable: false },
  )
  @JoinTable()
  colors?: Color[];

  @IsNotEmpty()
  @ManyToOne(() => Category, category => category.id, { nullable: false })
  category: Category;

  @Column({ nullable: true })
  images: string;

  @IsNotEmpty()
  @ManyToOne(() => Brand, brand => brand.id, { nullable: false })
  brand: Brand;

  @IsNotEmpty()
  @Column({unique: true})
  url: string;

  @ManyToMany(
    () => Tag,
    (tag) => tag.products,
    { cascade: true, nullable: true },
  )
  @JoinTable()
  tags?: Tag[];

  constructor(args?: {
    name: string,
    price: number,
    oldPrice: number,
    desc: string,
    available: boolean,
    colors?: Color[],
    category: Category,
    images: string,
    url: string,
    brand: Brand,
    tags?: Tag[],
  }) {
    if (args) {
      this.name = args.name;
      this.price = args.price;
      this.oldPrice = args.oldPrice;
      this.desc = args.desc;
      this.available = args.available;
      this.colors = args.colors;
      this.category = args.category;
      this.images = args.images;
      this.url = args.url;
      this.brand = args.brand;
      this.tags = args.tags;
    }
  }
}
