import {
  Column, CreateDateColumn,
  Entity, JoinColumn, ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Review } from './review.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => Review, (review) => review.comments, { cascade: true })
  @JoinColumn()
  review: Review;

  @IsNotEmpty()
  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(args?: { userId: string, review: Review, text: string }) {
    if (args) {
      this.userId = args.userId;
      this.review = args.review;
      this.text = args.text;
    }
  }
}
