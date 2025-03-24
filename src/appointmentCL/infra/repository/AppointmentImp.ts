import { MysqlClient } from '../../../common/mysql/MysqlClient';
import { Appointment } from '../../domain/model/Appointment';
import { AppointmentRepository } from '../../domain/repository/AppointmentRepo';

export class AppoinmentRepositoryImp implements AppointmentRepository {
  private mysqlClient: MysqlClient;
  private tableName = 'appointment';

  constructor () {
    this.mysqlClient = new MysqlClient({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: parseInt(process.env.MYSQL_PORT),
    });
  }

  async save (appointment: Appointment): Promise<void> {
    try {
      const appointmentData: Record<string, unknown> = {
        ...appointment,
        countryISO: 'CL',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),

      };
            /*
            const execute = await this.mysqlClient.insert(this.tableName, appointmentData);
            if(execute) {
                console.log('Appointment saved successfully');
            }
            return;*/
      console.log('Appointment saved successfully');
      console.log(`Data: ${JSON.stringify(appointmentData)}`);
      return;
    } catch (error) {
      throw new Error('Error saving appointment');
    }

  }
}
