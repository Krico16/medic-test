import { Appoinment } from "../../domain/models/Appoinment";
import { AppoinmentRepository } from "../../domain/repository/AppoinmentRepository";

export class GetAppoinment  {
    constructor(private repository: AppoinmentRepository) {}

    async execute(appoinmentId: string): Promise<any> {
        console.log('USE CASE:: GET APPOINMENT', appoinmentId);
        const result = await this.repository.getAppoinment(appoinmentId);
        return new Appoinment(result);
    }
}