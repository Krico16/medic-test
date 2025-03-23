import { AppoinmentRepository } from "../../domain/repository/AppoinmentRepository";
import { Appoinment } from "../../domain/models/Appoinment";

export class updateAppointment {
    constructor(private repository: AppoinmentRepository) { }

    async execute(appId: string, appointment: Appoinment): Promise<void> {
        console.log('USE CASE:: UPDATE APPOINTMENT', [appId, appointment]);
        const newAppoinment = new Appoinment({
            ...appointment,
            updatedAt: new Date().toISOString()
        });
        await this.repository.updateAppoinment(appId, newAppoinment);
    }
}