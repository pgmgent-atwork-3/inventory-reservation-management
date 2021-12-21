import { define, factory } from 'typeorm-seeding';
import * as Faker from 'faker';
import { Media } from 'src/medias/entities/media.entity';
import { Model } from 'src/models/entities/model.entity';

const types = ['jpeg', 'png', 'mp4'];

define(Media, (faker: typeof Faker) => {
  const media = new Media();
  media.model_id = factory(Model)() as any;
  media.type = 'jpeg';
  media.source = 'defaultImage.jpeg';
  return media;
});
