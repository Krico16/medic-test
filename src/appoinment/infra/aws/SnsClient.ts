import { PublishCommand, PublishCommandInput, SNSClient } from '@aws-sdk/client-sns';

export class SnsClient {
  private snsClient: SNSClient;
  private TopicSnsArn: string;

  constructor () {
    this.snsClient = new SNSClient({ region: process.env.REGION });
    this.TopicSnsArn = process.env.SNS_TOPIC_ARN;
    console.log('SNS:: Initialized', this.TopicSnsArn);

  }

  async sendNotification (countryISO: string, message: object): Promise<void> {
    const params: PublishCommandInput = {
      TopicArn: this.TopicSnsArn,
      Message: JSON.stringify(message),
      MessageAttributes: {
        countryISO: {
            DataType: 'String',
            StringValue: countryISO,
          },
      },
    };

    try {
      const command = new PublishCommand(params);
      const response = await this.snsClient.send(command);
      console.log('SNS:: Notification sent', response);
      return;
    } catch (error) {
      console.error('SNS:: Error sending notification', error);
      throw new Error('Error sending notification');
    }
  }
}
