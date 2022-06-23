import { Column, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Min, Max, IsNotEmpty } from 'class-validator';

@Entity()
export class Review {
  @Column({unique: true})
  id: string;

  @Min(1)
  @Max(10)
  @IsNotEmpty()
  @Column()
  rating: number;

  @Column()
  comment: string;

  @IsNotEmpty()
  @PrimaryColumn()
  productId: string;

  @IsNotEmpty()
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
