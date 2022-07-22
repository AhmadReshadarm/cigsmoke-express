import { Column, CreateDateColumn, Entity, Generated, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Min, Max, IsNotEmpty } from 'class-validator';

@Entity()
export class Review {
  @Column({ unique: true })
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

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(args?: { rating: number, comment: string, productId: string }) {
    if (args) {
      this.rating = args.rating;
      this.comment = args.comment;
      this.productId = args.productId;
    }
  }
}
