import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

@Entity()
export class WorkShift extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telegram_user_id: number;

  @Column({ default: null })
  rate: number;

  @Column({ default: null })
  start_time: Date;

  @Column({ default: null })
  end_time: Date;
}
