export interface Appointment {
  appointmentId: string;
  insuredId: string;
  scheduleId: string;
  centerId: string;
  specialityId: string;
  medicId: string;
  date: string;
  countryISO: string;
  status: string;
  updatedAt: string;
  createdAt: string;
}

export class MysqlAppointment {
  appointmentId: string;
  insuredId: string;
  scheduleId: string;
  centerId: string;
  specialityId: string;
  medicId: string;
  date: string;
  countryISO: string;
  status: string;
  updatedAt: string;
  createdAt: string;

  constructor (appointment: Appointment) {
    this.appointmentId = appointment.appointmentId;
    this.insuredId = appointment.insuredId;
    this.scheduleId = appointment.scheduleId;
    this.centerId = appointment.centerId;
    this.specialityId = appointment.specialityId;
    this.medicId = appointment.medicId;
    this.date = appointment.date;
    this.countryISO = appointment.countryISO;
    this.status = appointment.status;
    this.updatedAt = appointment.updatedAt;
    this.createdAt = appointment.createdAt;
  }

  static from (appointment: Appointment): MysqlAppointment {
    return new MysqlAppointment(appointment);
  }

  toAppointment (): Appointment {
    return {
      appointmentId: this.appointmentId,
      insuredId: this.insuredId,
      scheduleId: this.scheduleId,
      centerId: this.centerId,
      specialityId: this.specialityId,
      medicId: this.medicId,
      date: this.date,
      countryISO: this.countryISO,
      status: this.status,
      updatedAt: this.updatedAt,
      createdAt: this.createdAt,
    };
  }
}
