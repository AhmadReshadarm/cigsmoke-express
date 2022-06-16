import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany, ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { Parameter } from './parameter.entity';

@Tree("closure-table")
@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({unique: true})
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @TreeParent()
  parent?: Category;

  @TreeChildren()
  children: Category[];

  @ManyToMany(() => Parameter, (parameter) => parameter.categories)
  @JoinTable()
  parameters: Parameter[];

  @Column({unique: true})
  url: string;

  constructor(args?: { name: string, parent?: Category, url: string, parameters: Parameter[] }) {
    if (args) {
      this.name = args.name;
      this.url = args.url;
      this.parent = args.parent;
      this.parameters = args.parameters;
    }
  }
}
