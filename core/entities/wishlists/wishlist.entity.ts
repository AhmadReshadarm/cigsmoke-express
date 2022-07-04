import { Column, Entity, PrimaryColumn } from 'typeorm';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class Wishlist {
  @Column({unique: true})
  id: string;

  @IsNotEmpty()
  @PrimaryColumn()
  productId: string;

  @IsNotEmpty()
  @PrimaryColumn()
  userId: string;

  constructor(args?: { productId: string }) {
    if (args) {
      this.productId = args.productId;
    }
  }
}
