import { Appointment } from '../model/Appointment';

export interface AppointmentRepository {
  save (appointment: Appointment): Promise<void>;
}
