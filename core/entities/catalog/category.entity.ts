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
import { IsNotEmpty } from 'class-validator';

@Tree("closure-table")
@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column({ unique: true })
  name: string;

  @Column()
  image: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @TreeParent()
  parent?: Category;

  @TreeChildren()
  children: Category[];

  @OneToMany(() => Parameter, (parameter) => parameter.category)
  parameters: Parameter[];

  @IsNotEmpty()
  @Column({ unique: true })
  url: string;

  constructor(args?: { name: string, image: string, parent?: Category, url: string, parameters: Parameter[] }) {
    if (args) {
      this.name = args.name;
      this.image = args.image;
      this.url = args.url;
      this.parent = args.parent;
      this.parameters = args.parameters;
    }
  }
}
