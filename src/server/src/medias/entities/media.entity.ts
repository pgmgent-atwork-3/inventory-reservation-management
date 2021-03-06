import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Dates } from 'src/mixins/date.entity';
import { Model } from 'src/models/entities/model.entity';
import { PrimaryGeneratedColumn, Column, Entity, ManyToOne } from 'typeorm';

@Entity()
@ObjectType()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column()
  @Field()
  modelId: string;

  @Column()
  @Field()
  type: string;

  @Column()
  @Field()
  source: string;

  @Column(() => Dates)
  date: Dates;

  @ManyToOne(() => Model, (model) => model.medias, { onDelete: 'CASCADE'})
  @Field((type) => Model)
  model: Model;
}