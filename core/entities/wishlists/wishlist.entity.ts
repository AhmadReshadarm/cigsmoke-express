import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Wishlist {
  @Column({unique: true})
  id: string;

  @PrimaryColumn()
  productId: string;

  @PrimaryColumn()
  userId: string;

  constructor(args?: { productId: string, userId: string }) {
    if (args) {
      this.productId = args.productId;
      this.userId = args.userId;
    }
  }
}
