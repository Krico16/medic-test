import { Appoinment } from '../models/Appoinment';

export interface AppoinmentRepository {
  registerAppoinment: (appoinment: Appoinment) => Promise<void>;
  getAppoinment: (appoinmentId: string) => Promise<Appoinment>;
  listAppointments: (insuredId: string) => Promise<Appoinment[]>;
  updateAppoinment: (appointmentId: string, appoinment: Appoinment) => Promise<void>;
}
