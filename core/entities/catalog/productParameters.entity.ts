import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ProductVariant } from './productVariant.entity';

@Entity()
export class ProductParameter {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  key: string;

  @Column()
  value: string;

  @ManyToOne(() => ProductVariant, variant => variant.parameters, {
    onDelete: 'CASCADE', // Auto-delete parameters when variant is deleted
  })
  variant: ProductVariant;

  constructor(key?: string, value?: string) {
    if (key && value) {
      this.key = key;
      this.value = value;
    }
  }
}
