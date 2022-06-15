import { IsNotEmpty } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany, ManyToOne, OneToMany, OneToOne,
  PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent,
  UpdateDateColumn,
} from 'typeorm';

@Tree("closure-table")
@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @TreeParent()
  parent?: Category;

  @TreeChildren()
  children: Category[];

  @Column()
  url: string;

  constructor(args?: { name: string, parent?: Category, url: string }) {
    if (args) {
      this.name = args.name;
      this.url = args.url;
      this.parent = args.parent;
    }
  }
}
