import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DamagesService } from 'src/damages/damages.service';
import { Damage } from 'src/damages/entities/damage.entity';
import { DeviceStatusesService } from 'src/device-statuses/device-statuses.service';
import { DeviceStatus } from 'src/device-statuses/entities/device-status.entity';
import { Model } from 'src/models/entities/model.entity';
import { ModelsService } from 'src/models/models.service';
import { Reservation } from 'src/reservations/entities/reservation.entity';
import { ReservationsService } from 'src/reservations/reservations.service';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import {
  Repository,
  Between,
  LessThanOrEqual,
  Not,
  Equal,
  IsNull,
  Raw,
} from 'typeorm';
import { CreateDeviceInput } from './dto/create-device.input';
import { UpdateDeviceInput } from './dto/update-device.input';
import { Device } from './entities/device.entity';

interface DeviceCount {
  devices: Device[];
  count: number;
}
@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private devicesRepository: Repository<Device>,
    // private reservationsService: ReservationsService,
    private deviceStatusesService: DeviceStatusesService,
    // private usersService: UsersService,
    private damagesService: DamagesService,
    @Inject(forwardRef(() => ModelsService))
    private modelsService: ModelsService,
    @Inject(forwardRef(() => UsersService)) private usersService: UsersService,
    @Inject(forwardRef(() => ReservationsService))
    private reservationsService: ReservationsService,
  ) {}

  create(createDeviceInput: CreateDeviceInput): Promise<Device> {
    const newDevice = this.devicesRepository.create(createDeviceInput);

    return this.devicesRepository.save(newDevice);
  }

  async countWithName(name: string): Promise<number> {
    const rawData = await this.devicesRepository.query(`
    SELECT
      COUNT(DISTINCT device.id) AS total
    FROM
      "device"
    INNER JOIN "model" ON device."modelId" = model.id
    WHERE device.deleted_on IS NULL
    AND LOWER(model.name) LIKE LOWER('${name}%')
    `);
    return rawData[0].total;
  }

  async countDevicesInCheckWithName(name: string): Promise<number> {
    const rawData = await this.devicesRepository.query(`
    SELECT
      COUNT(DISTINCT device.id) AS total
    FROM
      "device"
    INNER JOIN "model" ON device."modelId" = model.id
    WHERE device.deleted_on IS NULL
    AND LOWER(model.name) LIKE LOWER('${name}%')
    AND device."deviceStatusId" = '${process.env.DEVICE_STATUS_INCHECK}'
    `);
    return rawData[0].total;
  }

  findAllByNameWithPagination(
    name: string,
    offset: number,
    limit: number,
  ): Promise<Device[]> {
    return this.devicesRepository.find({
      relations: ['model'],
      where: {
        model: {
          name: Raw((alias) => `LOWER(${alias}) Like '${name}%'`),
        },
      },
      skip: offset,
      take: limit,
      order: {
        created_on: 'ASC',
      },
    });
  }

  findAllInCheckByNameWithPagination(
    name: string,
    offset: number,
    limit: number,
  ): Promise<Device[]> {
    return this.devicesRepository.find({
      relations: ['model'],
      where: {
        deviceStatusId: process.env.DEVICE_STATUS_INCHECK,
        model: {
          name: Raw((alias) => `LOWER(${alias}) Like '${name}%'`),
        },
      },
      skip: offset,
      take: limit,
      order: {
        created_on: 'ASC',
      },
    });
  }

  async findAllPagination(offset: number, limit: number): Promise<any> {
    const test = await this.devicesRepository.findAndCount({
      skip: offset,
      take: limit,
      order: {
        id: 'ASC',
      },
    });
    return this.devicesRepository.find({
      skip: offset,
      take: limit,
      order: {
        id: 'ASC',
      },
    });
  }

  findAll(): Promise<Device[]> {
    return this.devicesRepository.find();
  }

  findAllBorrowedDevices(): Promise<Device[]> {
    return this.devicesRepository.find({
      userId: Not(IsNull()),
    });
  }

  findAllStockDevices(): Promise<Device[]> {
    return this.devicesRepository.find({
      userId: IsNull(),
    });
  }

  findAllInCheckDevices(): Promise<Device[]> {
    return this.devicesRepository.find({
      deviceStatusId: process.env.DEVICE_STATUS_INCHECK,
    });
  }

  findRecentNewDevices(): Promise<Device[]> {
    return this.devicesRepository.find({
      order: {
        created_on: 'DESC',
      },
      take: 5,
    });
  }

  findAndCount(): Promise<number> {
    return this.devicesRepository.count();
  }

  async getTotalDevicesByModelId(modelId: String): Promise<number> {
    const rawData = await this.devicesRepository.query(`
      SELECT
        COUNT(id) AS total
      FROM
        device
      WHERE "deleted_on" IS NULL
      AND "modelId" =  '${modelId}'
      AND "deviceStatusId" = '${process.env.DEVICE_STATUS_READY}'
    `);

    return rawData;
  }

  async findDifferenceLastMonth(): Promise<number> {
    const date = new Date();
    const iso = date.toISOString();
    const previousMonth = new Date();
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousIso = previousMonth.toISOString();
    const totalUsersLastMonth = await this.devicesRepository.count({
      created_on: LessThanOrEqual(previousIso),
    });
    const totalUsersNow = await this.devicesRepository.count();
    const difference = totalUsersNow - totalUsersLastMonth;
    return difference;
  }

  findRecentDevices(from: string, to: string): Promise<Device[]> {
    const date = new Date(Number(from));
    const iso = date.toISOString();
    const date1 = new Date(Number(to));
    const iso1 = date1.toISOString();
    return this.devicesRepository.find({
      created_on: Between(iso, iso1),
    });
  }

  findAllByModelId(modelId: string): Promise<Device[]> {
    return this.devicesRepository.find({
      modelId: modelId,
      deviceStatusId: `'${process.env.DEVICE_STATUS_READY}'`,
    });
  }

  findAllByModelIdWithPagination(
    modelId: string,
    offset: number,
    limit: number,
  ): Promise<Device[]> {
    return this.devicesRepository.find({
      where: {
        modelId: modelId,
        deviceStatusId: `${process.env.DEVICE_STATUS_READY}`,
      },
      skip: (offset - 1) * limit,
      take: limit,
      order: {
        id: 'ASC',
      },
    });
  }

  findOne(id: string): Promise<Device> {
    return this.devicesRepository.findOneOrFail(id);
  }

  findOneByDeviceId(id: string): Promise<Device> {
    return this.devicesRepository.findOne({
      id: id,
      deviceStatusId: `${process.env.DEVICE_STATUS_READY}`,
    });
  }

  async update(
    id: string,
    updateDeviceInput: UpdateDeviceInput,
  ): Promise<Device> {
    const updatedDevice = await this.devicesRepository.preload({
      id: id,
      ...updateDeviceInput,
    });

    return this.devicesRepository.save(updatedDevice);
  }

  async remove(id: string): Promise<Device> {
    const device = await this.findOne(id);
    return this.devicesRepository.remove(device);
  }

  async softRemove(id: string): Promise<Device> {
    const device = await this.findOne(id);
    return this.devicesRepository.softRemove(device);
  }

  getDeviceReservations(deviceId: string): Promise<Reservation[]> {
    return this.reservationsService.findAllByDeviceId(deviceId);
  }

  getDeviceDamages(deviceId: string): Promise<Damage[]> {
    return this.damagesService.findAllByDeviceId(deviceId);
  }

  getDeviceStatusByDeviceStatusId(
    deviceStatusId: string,
  ): Promise<DeviceStatus> {
    return this.deviceStatusesService.findOne(deviceStatusId);
  }

  getUserByUserId(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  getModelByDeviceId(modelId: string): Promise<Model> {
    return this.modelsService.findOne(modelId);
  }
}
