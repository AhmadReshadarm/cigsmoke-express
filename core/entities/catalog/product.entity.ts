import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductVariant } from './productVariant.entity';
import { Tag } from './tag.entity';
import { ProductParameter } from './productParameters.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column()
  name: string;

  @Column('text', { nullable: true })
  desc: string;
  @Column('text', { nullable: true })
  shortDesc: string;
  @Column('text', { nullable: true })
  keywords: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @IsNotEmpty()
  @ManyToOne(() => Category, category => category.id, { nullable: false, cascade: true, onDelete: 'CASCADE' })
  category: Category;

  @IsNotEmpty()
  @Column({ unique: true })
  url: string;

  @ManyToMany(() => Tag, tag => tag.products, { cascade: true, nullable: true })
  @JoinTable()
  tags?: Tag[];

  // @OneToMany(() => ProductParameter, param => param.variant, {
  //   cascade: true,
  //   nullable: true,
  // })
  // parameters: ProductParameter[];

  @OneToMany(() => ProductVariant, productVariant => productVariant.product)
  productVariants: ProductVariant[];

  constructor(args?: {
    name: string;
    desc: string;
    shortDesc: string;
    keywords: string;
    category: Category;
    url: string;
    tags?: Tag[];
    productVariants: ProductVariant[];
    // parameters: ProductParameter[];
  }) {
    if (args) {
      this.name = args.name;
      this.desc = args.desc;
      this.shortDesc = args.shortDesc;
      this.keywords = args.keywords;
      this.category = args.category;
      this.url = args.url;
      this.tags = args.tags;
      this.productVariants = args.productVariants;
      // this.parameters = args.parameters;
    }
  }
}
