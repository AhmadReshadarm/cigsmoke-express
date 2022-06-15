import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  title: string;

  constructor(args?: { title: string }) {
    if (args) {
      this.title = args.title;
    }
  }
}
