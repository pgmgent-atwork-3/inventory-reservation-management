import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateReservationInput } from './dto/create-reservation.input';
import { UpdateReservationInput } from './dto/update-reservation.input';
import { Reservation } from './entities/reservation.entity';
import moment from 'moment';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  create(createReservationInput: CreateReservationInput): Promise<Reservation> {
    const newReservation = this.reservationsRepository.create(
      createReservationInput,
    );

    return this.reservationsRepository.save(newReservation);
  }

  findAll(): Promise<Reservation[]> {
    return this.reservationsRepository.find();
  }

  findAllByDeviceId(deviceId: string): Promise<Reservation[]> {
    return this.reservationsRepository.find({deviceId});
  }

  findTotalMonthReservations(month: string): Promise<number> {
    const startDate = moment(month).startOf('month').toISOString();
    const endDate = moment(month).endOf('month').toISOString();
    console.log(startDate);
    console.log(endDate);


    return this.reservationsRepository.count({
      start_date: Between(startDate, endDate) 
    });
  }

  async reservationsOverview(today: string):Promise<any> {

    const rawData = await this.reservationsRepository.query(`
      SELECT
        DATE_TRUNC('month', start_date) AS month,
        COUNT(id) AS total_reservations
      FROM
        reservation
      WHERE start_date <= '${today}'
      GROUP BY
        DATE_TRUNC('month', reservation.start_date)
      ORDER BY 
        month DESC
      LIMIT 12
    `);
    console.log(rawData)
    return rawData;
  }

  findOne(id: string): Promise<Reservation> {
    return this.reservationsRepository.findOneOrFail(id);
  }

  async update(
    id: string,
    updateReservationInput: UpdateReservationInput,
  ): Promise<Reservation> {
    const updatedReservation = await this.reservationsRepository.preload({
      id: id,
      ...updateReservationInput,
    });

    return this.reservationsRepository.save(updatedReservation);
  }

  async remove(id: string): Promise<Reservation> {
    const reservation = await this.findOne(id);
    return this.reservationsRepository.remove(reservation);
  }
}
