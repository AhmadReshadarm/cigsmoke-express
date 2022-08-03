import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Color } from './color.entity';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { IsNotEmpty, IsPositive, Min } from 'class-validator';
import { Tag } from './tag.entity';
import { ParameterProduct } from './parameterProduct.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column()
  name: string;

  @IsNotEmpty()
  @Column()
  @IsPositive()
  price: number;

  @Column({ nullable: true })
  oldPrice?: number;

  @Column('text', { nullable: true })
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
  colors: Color[];

  @IsNotEmpty()
  @ManyToOne(() => Category, category => category.id, { nullable: false, cascade: true, onDelete: 'CASCADE' })
  category: Category;

  @Column({ nullable: true })
  images: string;

  @IsNotEmpty()
  @ManyToOne(() => Brand, brand => brand.id, { nullable: false, cascade: true, onDelete: 'CASCADE' })
  brand: Brand;

  @IsNotEmpty()
  @Column({ unique: true })
  url: string;

  @ManyToMany(
    () => Tag,
    (tag) => tag.products,
    { cascade: true, nullable: true },
  )
  @JoinTable()
  tags?: Tag[];

  @OneToMany(() => ParameterProduct, (parameterProducts) => parameterProducts.productId)
  // @JoinColumn()
  parameterProduct: ParameterProduct[]

  constructor(args?: {
    name: string,
    price: number,
    desc: string,
    available: boolean,
    colors: Color[],
    oldPrice?: number,
    category: Category,
    images: string,
    url: string,
    brand: Brand,
    tags?: Tag[],
    parameterProduct: ParameterProduct[],
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
      this.parameterProduct = args.parameterProduct;
    }
  }
}
