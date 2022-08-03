import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';
import { IsNotEmpty } from 'class-validator';
import { ParameterProduct } from './parameterProduct.entity';
import { Product } from './product.entity';

@Entity()
export class Parameter {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column({ unique: true })
  name: string;

  @ManyToOne(
    () => Category,
    (category) => category.parameters,
    { cascade: true, onDelete: 'CASCADE' },
  )
  category: Category

  @OneToMany(() => Product, (products) => products.parameterProduct)
  // @JoinColumn()
  parameterProduct: Product[]

  constructor(args?: { name: string, category: Category }) {
    if (args) {
      this.name = args.name;
      this.category = args.category;
    }
  }
}
