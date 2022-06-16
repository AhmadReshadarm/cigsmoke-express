import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

@Entity()
export class Parameter {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @ManyToMany(
    () => Category,
    (category) => category.parameters,
    { cascade: true },
  )
  categories: Category[]

  constructor(args?: { name: string, categories: Category[] }) {
    if (args) {
      this.name = args.name;
      this.categories = args.categories;
    }
  }
}
