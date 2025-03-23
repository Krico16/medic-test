import { z } from "zod";
import { CreateAppoinment } from "../../application/useCases/CreateAppoinment";
import { AppoinmentRepositoryImp } from "../aws/DynamoRepo";
import { MessageUtil } from "../../../common/utils/response";
import { Appoinment } from "../../domain/models/Appoinment";
import { GetAppoinment } from "../../application/useCases/GetAppointment";
import { Request } from "../../../common/utils/middleware";
import { SnsClient } from "../aws/SnsClient";
import { updateAppointment } from "../../application/useCases/UpdateAppointment";


const registerAppoinmentSchema = z.object({
    insuredId: z.string(),
    scheduleId: z.object({
        scheduleId: z.string(),
        centerId: z.string(),
        specialityId: z.string(),
        medicId: z.string(),
        date: z.string()
    }),
    countryISO: z.enum(['PE', 'CL']),
    status: z.string().optional()
});


export class AppoinmentController {
    private CreateAppointment: CreateAppoinment;
    private GetAppointment: GetAppoinment;
    private UpdateAppointmentSvc: updateAppointment;

    constructor() {
        const appoinmentRepository = new AppoinmentRepositoryImp();
        const SNSService = new SnsClient();
        this.CreateAppointment = new CreateAppoinment(appoinmentRepository, SNSService);
        this.GetAppointment = new GetAppoinment(appoinmentRepository);
        this.UpdateAppointmentSvc = new updateAppointment(appoinmentRepository);
        console.log('AppoinmentController initialized', { 
            CreateAppointment: this.CreateAppointment, 
            GetAppointment: this.GetAppointment,
            UpdateAppointmentSvc: this.UpdateAppointmentSvc
         });
    }

    async registerAppoinment(request: Request): Promise<any> {
        console.info(`REQUEST:: POST /appointment - ${JSON.stringify(request)}`);
        try {
            const { body } = request;
            const validatedBody = registerAppoinmentSchema.safeParse(body);
            if (!validatedBody.success) {
                return MessageUtil.error(400, 'Validation error', validatedBody.error);
            }
            const data = validatedBody.data;
            await this.CreateAppointment.execute({
                insuredId: data.insuredId,
                scheduleId: {
                    ...data.scheduleId,
                    date: new Date(data.scheduleId.date).toISOString()
                },
                countryISO: data.countryISO,
                status: "PENDING"
            } as Appoinment);
            return MessageUtil.success({ message: 'Appoinment created successfully' });
        } catch (error) {
            console.error(error);
            return MessageUtil.error(500, 'An Error has ocurred', error.message);
        }
    }

    async SearchAppoinment(request: Request): Promise<any> {
        console.info(`REQUEST:: GET /appointment - ${JSON.stringify(request)}`);
        try {
            const { appoinmentId } = request.params;
            if (!appoinmentId) {
                return MessageUtil.error(400, 'Validation error', { message: 'appoinmentId is required' });
            }
            console.info(`FINDING APPOINMENT ${appoinmentId}`);
            const appoinment = await this.GetAppointment.execute(appoinmentId);
            return MessageUtil.success(appoinment);
        } catch (error) {
            console.error(error);
            return MessageUtil.error(500, 'An Error has ocurred', error.message);
        }
    }

    async updateAppointment(body: any): Promise<any> {
        console.info(`REQUEST:: SQS /appointment - ${JSON.stringify(body)}`);
        try {
            const { body: { appointmentId, status } } = body;
            if (!appointmentId || !status) {
                return MessageUtil.error(400, 'Validation error', { message: 'appoinmentId and status are required' });
            }
            console.info(`UPDATING APPOINMENT ${appointmentId}`);
            await this.UpdateAppointmentSvc.execute(appointmentId, status);
            return MessageUtil.success({ message: 'Appoinment updated successfully' });
        } catch (error) {
            console.error(error);
            return MessageUtil.error(500, 'An Error has ocurred', error.message);
        }
    }
}