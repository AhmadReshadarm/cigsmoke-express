import { IsNotEmpty, IsPositive } from 'class-validator';
import { Column, Entity, JoinTable, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderProduct } from '../orders';
import { Color } from './color.entity';
import { Product } from './product.entity';
import { ProductParameter } from './productParameters.entity';
@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column()
  @IsPositive()
  price: number;

  @Column({ nullable: true })
  oldPrice?: number;

  @Column()
  artical: string;

  @IsNotEmpty()
  @Column({ default: false })
  available: boolean;

  @IsNotEmpty()
  @ManyToOne(() => Color, color => color.productVariants, { cascade: true, nullable: true })
  @JoinTable()
  color: Color;

  @Column('text', { nullable: true })
  images: string;
  // other availabel slution with the limition of *More complex queries on JSON fields require MySQL JSON functions * No direct database-level validation of array contents
  // @Column('array', { nullable: true })
  // parameterProduct: Array<{ key: string; value: string }>;

  @OneToMany(() => ProductParameter, param => param.variant, {
    cascade: true, // Auto-save parameters when variant is saved
    nullable: true,
    eager: true, // Optional: Auto-load parameters with variant
  })
  @JoinTable()
  parameters: ProductParameter[];

  @ManyToOne(() => Product, product => product.productVariants, { cascade: true, onDelete: 'CASCADE' })
  product: Product;

  constructor(args?: {
    price: number;
    available: boolean;
    color: Color;
    artical: string;
    oldPrice?: number;
    images: string;
    product: Product;
    orderProducts: OrderProduct[];
    parameters: ProductParameter[];
  }) {
    if (args) {
      this.product = args.product;
      this.price = args.price;
      this.oldPrice = args.oldPrice;
      this.artical = args.artical;
      this.available = args.available;
      this.color = args.color;
      this.images = args.images;
      this.parameters = args.parameters;
    }
  }
}
