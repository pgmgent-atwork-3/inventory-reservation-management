import { ObjectType, Field } from '@nestjs/graphql';
import { Damage } from 'src/damages/entities/damage.entity';
import { DeviceStatus } from 'src/device-statuses/entities/device-status.entity';
import { Model } from 'src/models/entities/model.entity';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Device {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  modelId: string;

  @Column()
  @Field()
  deviceStatusId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  @Field({ nullable: true })
  qr_code: string;

  @CreateDateColumn()
  @Field()
  created_on: Date;

  @UpdateDateColumn()
  @Field()
  updated_on: Date;

  @DeleteDateColumn()
  @Field()
  deleted_on: Date;

  @OneToMany(() => Damage, (damage) => damage.device)
  @Field((type) => [Damage], { nullable: true })
  damages?: Damage[];

  @OneToMany(() => Reservation, (reservation) => reservation.device)
  @Field((type) => [Reservation], { nullable: true })
  reservations?: Reservation[];

  @ManyToOne(() => DeviceStatus, (deviceStatus) => deviceStatus.devices)
  @Field((type) => DeviceStatus)
  deviceStatus: DeviceStatus;

  @ManyToOne(() => User, (user) => user.devices, { onDelete: 'SET NULL' })
  @Field((type) => User)
  user: User;

  @ManyToOne(() => Model, (model) => model.devices)
  @Field((type) => Model)
  model: Model;
}
