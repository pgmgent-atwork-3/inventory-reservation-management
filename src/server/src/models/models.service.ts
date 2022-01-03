import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DevicesService } from 'src/devices/devices.service';
import { Device } from 'src/devices/entities/device.entity';
import { Media } from 'src/medias/entities/media.entity';
import { MediasService } from 'src/medias/medias.service';
import { Tag } from 'src/tags/entities/tag.entity';
import { TagsService } from 'src/tags/tags.service';
import { Repository, Between, LessThanOrEqual } from 'typeorm';
import { CreateModelInput } from './dto/create-model.input';
import { UpdateModelInput } from './dto/update-model.input';
import { Model } from './entities/model.entity';

@Injectable()
export class ModelsService {
  constructor(
    @InjectRepository(Model) private modelsRepository: Repository<Model>,
    private tagsService: TagsService,
    private mediasService: MediasService,
    @Inject(forwardRef(() => DevicesService)) private devicesService: DevicesService,
  ) {}

  create(createModelInput: CreateModelInput): Promise<Model> {
    const newModel = this.modelsRepository.create(createModelInput);

    return this.modelsRepository.save(newModel);
  }

  findAll(): Promise<Model[]> {
    return this.modelsRepository.find();
  }

  findAndCount(): Promise<number> {
    return this.modelsRepository.count();
  }

  findRecentModels(from: string, to:string): Promise<Model[]> {
    const date = new Date(Number(from));
    const iso = date.toISOString();
    const date1 = new Date(Number(to));
    const iso1 = date1.toISOString();

    return this.modelsRepository.find({
      created_on: Between(iso
        , iso1),
    })
  }

  async findDifferenceLastMonth(): Promise<number> {
    const date = new Date();
    const iso = date.toISOString();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousIso = previousMonth.toISOString();
    const totalUsersLastMonth = await this.modelsRepository.count({
      created_on: LessThanOrEqual(previousIso)
    })
    const totalUsersNow = await this.modelsRepository.count();
    const difference = totalUsersNow - totalUsersLastMonth;
    return difference;
  }

  getMediasByModelId(modelId: string): Promise<Media[]> {
    return this.mediasService.findAllByModelId(modelId);
  }

  getDevicesByModelId(modelId: string): Promise<Device[]> {
    return this.devicesService.findAllByModelId(modelId);
  }

  findOne(id: string): Promise<Model> {
    return this.modelsRepository.findOneOrFail(id);
  }

  async update(id: string, updateModelInput: UpdateModelInput): Promise<Model> {
    const updatedModel = await this.modelsRepository.preload({
      id: id,
      ...updateModelInput,
    });

    return this.modelsRepository.save(updatedModel);
  }

  async remove(id: string): Promise<Model> {
    const model = await this.findOne(id);
    return this.modelsRepository.remove(model);
  }

  async addToTag(modelId: string, tagId: string): Promise<Model> {
    const foundModel = await this.modelsRepository.findOne(
      { id: modelId },
      { relations: ['tags'] },
    );
    const foundTag = await this.tagsService.findOne(tagId);

    if (foundModel && foundTag) {
      foundModel.tags = foundModel.tags
        ? [...foundModel.tags, foundTag]
        : [foundTag];

      return this.modelsRepository.save(foundModel);
    } else {
      throw new Error(`Founding model or tag problem`);
    }
  }

  async removeFromTag(modelId: string, tagId: string): Promise<Model> {
    const foundModel = await this.modelsRepository.findOne(
      { id: modelId },
      { relations: ['tags'] },
    );
    const foundTag = await this.tagsService.findOne(tagId);

    if (foundModel && foundTag) {
      foundModel.tags = foundModel.tags
        ? [...foundModel.tags.filter((f) => f.id != tagId)]
        : [];

      return this.modelsRepository.save(foundModel);
    } else {
      throw new Error(`Founding model or tag problem`);
    }
  }
}
