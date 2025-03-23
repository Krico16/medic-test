import { v4 as uuidv4 } from 'uuid'

export interface AppoinmentProps {
    appointmentId?: string;
    insuredId: string;
    scheduleId: ScheduleId;
    countryISO: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

interface ScheduleId {
    scheduleId: string;
    centerId: string;
    specialityId: string;
    medicId: string;
    date: string;
}

export class Appoinment {

    public readonly appointmentId: string;
    public readonly insuredId: string;
    public readonly scheduleId: ScheduleId;
    public readonly countryISO: string;
    public readonly status: string;
    public readonly createdAt?: string;
    public readonly updatedAt?: string;

    constructor(props: AppoinmentProps) {
        this.appointmentId = props.appointmentId || uuidv4();
        this.insuredId = props.insuredId;
        this.scheduleId = props.scheduleId;
        this.countryISO = props.countryISO;
        this.status = props.status;
        this.createdAt = props.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}