import { IsNotEmpty } from 'class-validator';
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Brand {
  @PrimaryGeneratedColumn()
  id: string;

  @IsNotEmpty()
  @Column({ unique: true} )
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  showOnMain: boolean;

  constructor(args?: { name: string, image: string, showOnMain: boolean }) {
    if (args) {
      this.name = args.name;
      this.image = args.image;
      this.showOnMain = args.showOnMain;
    }
  }
}
