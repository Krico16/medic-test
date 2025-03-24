import { EventBridgeClient, PutEventsCommand, PutEventsCommandInput } from '@aws-sdk/client-eventbridge';

export class EventBridgeService {
  private eventBridge: EventBridgeClient;

  constructor () {
    this.eventBridge = new EventBridgeClient({ region: process.env.REGION });
    console.log('EventBridge:: Initialized');
  }

  async sendEvent (data: any, detailType: string, source: string): Promise<void> {
    const params: PutEventsCommandInput = {
      Entries: [
        {
          Detail: JSON.stringify(data),
          DetailType: detailType,
          Source: source,
          EventBusName: 'completed-appointments',
        },
      ],
    };

    try {
      const send = await this.eventBridge.send(new PutEventsCommand(params));
      console.log('EventBridge:: Event sent', send);
    } catch (error) {
      console.error('EventBridge:: Error sending event', error);
      throw new Error('Error sending event');
    }
  }
}
