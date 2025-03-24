import { MessageUtil } from '../../../common/utils/response';
import { CreateAppointmentUseCase } from '../../app/useCases/CreateAppointment';
import { AppoinmentRepositoryImp } from '../repository/AppointmentImp';

export class AppoinmentCountryController {
  private saveAppointmentUseCase: CreateAppointmentUseCase;

  constructor () {
    const repository = new AppoinmentRepositoryImp();
    this.saveAppointmentUseCase = new CreateAppointmentUseCase(repository);
    console.log('AppoinmentCountryController initialized', { saveAppointmentUseCase: this.saveAppointmentUseCase });
  }

  async createAppointment (request: any): Promise<any> {
    try {
      const message = request.Message;
      await this.saveAppointmentUseCase.execute(JSON.parse(message));
      return MessageUtil.success({ message: 'Appointment created successfully' });
    } catch (error) {
      console.error(error);
      return MessageUtil.error(500, 'An Error has ocurred', error.message);
    }
  }
}
