import { Appoinment } from '../../domain/models/Appoinment';
import { AppoinmentRepository } from '../../domain/repository/AppoinmentRepository';
import { SnsClient } from '../../infra/aws/SnsClient';

export class CreateAppoinment {
  private SnsService: SnsClient;
  constructor (private repository: AppoinmentRepository, snsService: SnsClient) {
    this.SnsService = snsService;
  }

  async execute (appoinment: Appoinment): Promise<void> {
    console.log('USE CASE:: CREATE APPOINMENT', JSON.stringify(appoinment));

    const newAppoinment = new Appoinment(appoinment);
    await this.repository.registerAppoinment(newAppoinment);
    await this.sendNotification(newAppoinment);
    return;
  }

  private async sendNotification (appointmentData: Appoinment): Promise<void> {
    const message = {
      appointmentId: appointmentData.appointmentId,
      insuredId: appointmentData.insuredId,
      scheduleId: appointmentData.scheduleId,
      countryISO: appointmentData.countryISO,
      status: appointmentData.status,
    };
    await this.SnsService.sendNotification(appointmentData.countryISO, message);
  }
}
