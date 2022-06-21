import { Column, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Min, Max } from 'class-validator';

@Entity()
export class Review {
  @Column({unique: true})
  id: string;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @PrimaryColumn()
  productId: string;

  @PrimaryColumn()
  userId: string;


  constructor(args?: { rating: number, comment: string, productId: string, userId: string }) {
    if (args) {
      this.rating = args.rating;
      this.comment = args.comment;
      this.productId = args.productId;
      this.userId = args.userId;
    }
  }
}
