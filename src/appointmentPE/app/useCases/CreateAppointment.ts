import { EventBridgeService } from '../../../common/aws/EventBridge';
import { Appointment, MysqlAppointment } from '../../domain/model/Appointment';
import { AppointmentRepository } from '../../domain/repository/AppointmentRepo';

export class CreateAppointmentUseCase {
  private eventBridge: EventBridgeService;
  constructor (private repository: AppointmentRepository) {
    this.eventBridge = new EventBridgeService();
  }

  async execute (appointment: any): Promise<void> {
    console.log('USE CASE:: CREATE APPOINTMENT', appointment);
    const objAppointment = new MysqlAppointment(appointment);
    console.info(`Created appointment: ${JSON.stringify(objAppointment)}`);
    await this.repository.save(objAppointment);
    await this.eventBridge.sendEvent({
      appointmentId: appointment.appointmentId,
      appointmentDate: appointment.scheduleId.date,
      countryISO: appointment.countryISO,
      status: 'COMPLETED',
    }, 'appointment-confirmation', 'appointment');
  }
}
