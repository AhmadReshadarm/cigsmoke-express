import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Color {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  constructor(args?: { name: string }) {
    if (args) {
      this.name = args.name;
    }
  }
}
