import { z } from 'zod';
import { Request } from '../../../common/utils/middleware';
import { MessageUtil } from '../../../common/utils/response';
import { CreateAppoinment } from '../../application/useCases/CreateAppoinment';
import { GetAppoinment } from '../../application/useCases/GetAppointment';
import { ListAppointments } from '../../application/useCases/ListAppointments';
import { updateAppointment } from '../../application/useCases/UpdateAppointment';
import { Appoinment } from '../../domain/models/Appoinment';
import { AppoinmentRepositoryImp } from '../aws/DynamoRepo';
import { SnsClient } from '../aws/SnsClient';

const registerAppoinmentSchema = z.object({
  insuredId: z.string(),
  scheduleId: z.object({
    scheduleId: z.string(),
    centerId: z.string(),
    specialityId: z.string(),
    medicId: z.string(),
    date: z.string(),
  }),
  countryISO: z.enum(['PE', 'CL']),
  status: z.string().optional(),
});

export class AppoinmentController {
  private CreateAppointment: CreateAppoinment;
  private GetAppointment: GetAppoinment;
  private UpdateAppointmentSvc: updateAppointment;
  private ListAppointmentsSvc: ListAppointments;

  constructor () {
    const appoinmentRepository = new AppoinmentRepositoryImp();
    const SNSService = new SnsClient();
    this.CreateAppointment = new CreateAppoinment(appoinmentRepository, SNSService);
    this.GetAppointment = new GetAppoinment(appoinmentRepository);
    this.UpdateAppointmentSvc = new updateAppointment(appoinmentRepository);
    this.ListAppointmentsSvc = new ListAppointments(appoinmentRepository);
    console.log('AppoinmentController initialized', {
      CreateAppointment: this.CreateAppointment,
      GetAppointment: this.GetAppointment,
      UpdateAppointmentSvc: this.UpdateAppointmentSvc,
      ListAppointmentsSvc: this.ListAppointmentsSvc,
    });
  }

  async registerAppoinment (request: Request): Promise<MessageUtil> {
    console.info(`REQUEST:: POST /appointment - ${JSON.stringify(request)}`);
    try {
      const {body} = request;
      const validatedBody = registerAppoinmentSchema.safeParse(body);
      if (!validatedBody.success) {
        return MessageUtil.error(400, 'Validation error', validatedBody.error);
      }
      const data = validatedBody.data;
      await this.CreateAppointment.execute({
        insuredId: data.insuredId,
        scheduleId: {
          ...data.scheduleId,
          date: new Date(data.scheduleId.date).toISOString(),
        },
        countryISO: data.countryISO,
        status: 'PENDING',
      } as Appoinment);
      return MessageUtil.success({message: 'Appoinment created successfully'});
    } catch (error) {
      console.error(error);
      return MessageUtil.error(500, 'An Error has ocurred', error.message);
    }
  }

  async SearchAppoinment (request: Request): Promise<any> {
    console.info(`REQUEST:: GET /appointment - ${JSON.stringify(request)}`);
    try {
      const {appointmentId} = request.params;
      if (!appointmentId) {
        return MessageUtil.error(400, 'Validation error', {message: 'appoinmentId is required'});
      }
      console.info(`FINDING APPOINMENT ${appointmentId}`);
      const appoinment = await this.GetAppointment.execute(appointmentId);
      if (!appoinment) {
        return MessageUtil.error(404, 'Not Found', {message: 'Appoinment not found'});
      }
      return MessageUtil.success(appoinment);
    } catch (error) {
      console.error(error);
      return MessageUtil.error(500, 'An Error has ocurred', error.message);
    }
  }

  async ListAppointments (request: Request): Promise<any> {
    console.info(`REQUEST:: GET /appointments - ${JSON.stringify(request)}`);
    try {
      const {insuredId} = request.params;
      if (!insuredId) {
        return MessageUtil.error(400, 'Validation error', {message: 'insuredId is required'});
      }
      console.info(`LISTING APPOINMENTS FOR INSURED ${insuredId}`);
      const appointments = await this.ListAppointmentsSvc.execute(insuredId);
      return MessageUtil.success(appointments);
    } catch (error) {
      console.error(error);
      return MessageUtil.error(500, 'An Error has ocurred', error.message);
    }
  }

  async updateAppointment (body: any): Promise<any> {
    console.info(`REQUEST:: SQS /appointment - ${JSON.stringify(body)}`);
    try {
      const {body: {appointmentId, status}} = body;
      if (!appointmentId || !status) {
        return MessageUtil.error(400, 'Validation error', {message: 'appoinmentId and status are required'});
      }
      console.info(`UPDATING APPOINMENT ${appointmentId}`);
      await this.UpdateAppointmentSvc.execute(appointmentId, status);
      return MessageUtil.success({message: 'Appoinment updated successfully'});
    } catch (error) {
      console.error(error);
      return MessageUtil.error(500, 'An Error has ocurred', error.message);
    }
  }
}
