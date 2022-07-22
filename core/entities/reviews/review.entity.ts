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

  @Column({ default: false })
  showOnMain: boolean;

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

  constructor(args?: { rating: number, comment: string, showOnMain: boolean, productId: string }) {
    if (args) {
      this.rating = args.rating;
      this.comment = args.comment;
      this.showOnMain = args.showOnMain;
      this.productId = args.productId;
    }
  }
}
