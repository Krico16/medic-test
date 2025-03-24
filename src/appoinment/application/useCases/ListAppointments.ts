import { AppoinmentRepository } from '../../domain/repository/AppoinmentRepository';

export class ListAppointments {
  constructor (private repository: AppoinmentRepository) {}

  async execute (insuredId: string): Promise<any> {
    console.log('USE CASE:: LIST APPOINMENTS', { insuredId });
    return this.repository.listAppointments(insuredId);
  }
}
