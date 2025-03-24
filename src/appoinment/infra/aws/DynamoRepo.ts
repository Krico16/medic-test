import { DynamoDBClient, GetItemCommand, GetItemCommandInput, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument, GetCommand, GetCommandInput, PutCommand, PutCommandInput, ScanCommand, UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { AppoinmentRepository } from '../../domain/repository/AppoinmentRepository';

export class AppoinmentRepositoryImp implements AppoinmentRepository {
  private readonly dynamoClient: DynamoDBDocument;
  private readonly tableName: string;

  constructor () {
    const dynamoClient = new DynamoDBClient({});
    this.dynamoClient = DynamoDBDocument.from(dynamoClient);
    this.tableName = process.env.DYNAMODB_TABLE!;
  }

  async registerAppoinment (appoinment: any): Promise<void> {
    console.info('REPOSITORY:: REGISTER APPOINMENT', JSON.stringify(appoinment));
    console.log('TABLE NAME', this.tableName);
    const params = {
      TableName: this.tableName,
      Item: appoinment,
    };

    await this.dynamoClient.send(new PutItemCommand(params));
  }

  async getAppoinment (appoinmentId: string): Promise<any> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        appointmentId: appoinmentId,
      },
    };

    const result = await this.dynamoClient.send(new GetItemCommand(params));
    return result.Item;
  }

  async listAppointments (insuredId: string): Promise<any[]> {
    const params = {
      TableName: this.tableName,
      FilterExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: {
        ':insuredId': insuredId,
      },
    };

    const result = await this.dynamoClient.send(new ScanCommand(params));
    // Transform items into a list of object appointment
    return result.Items || [];
  }

  async updateAppoinment (appointmentId: string, appoinment: any): Promise<void> {
    console.info('REPOSITORY:: UPDATE APPOINMENT', JSON.stringify(appoinment));
    const oldData = await this.getAppoinment(appointmentId);
    const params: PutCommandInput = {
      TableName: this.tableName,
      Item: {
        ...oldData,
        appointmentId: appointmentId,
        updatedAt: new Date().toISOString(),
        status: 'COMPLETED',
      },
    };

    await this.dynamoClient.send(new PutCommand(params));
  }
}
