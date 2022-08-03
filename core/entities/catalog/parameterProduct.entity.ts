import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { IsNotEmpty, IsString } from 'class-validator';
import { Product } from './product.entity';
import { Parameter } from './parameter.entity';

@Entity()
export class ParameterProduct {

  @PrimaryColumn()
  productId: string

  @ManyToOne(() => Product, (product) => product.parameterProduct,{ cascade: true, onDelete: 'CASCADE' } )
  product: Product

  @PrimaryColumn()
  parameterId: string

  @ManyToOne(() => Parameter, (parameter) => parameter.parameterProduct,{ cascade: true, onDelete: 'CASCADE' })
  parameter: Parameter

  @IsNotEmpty()
  @IsString()
  @Column()
  value: string;

  constructor(args?: { productId: string, parameterId: string, value: string, }) {
    if (args) {
      this.productId = args.productId;
      this.parameterId = args.parameterId;
      this.value = args.value;
    }
  }
}
