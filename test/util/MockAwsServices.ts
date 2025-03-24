import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { DynamoDBDocument, PutCommand } from '@aws-sdk/lib-dynamodb';
import { mocked } from 'jest-mock';


const mockedDynamoDB = mocked(DynamoDBClient.prototype);
const mockedSNS = mocked(SNSClient.prototype);

export const mockAwsServices = () => {
  jest.clearAllMocks();

  mockedDynamoDB.send.mockResolvedValue({} as never);
  mockedSNS.send.mockResolvedValue({ MessageId: 'mock-message-id' } as never);
};

export const mockServices = () => {
  mockedDynamoDB.send.mockImplementation(command=> {
    if (command instanceof PutCommand || command instanceof PutItemCommand) {
      return Promise.resolve({});
    }
    return Promise.resolve({});
  })
  mockedSNS.send.mockImplementation((command) => {
    if (command instanceof PublishCommand) {
      return Promise.resolve({MessageId: 'mock-message-id'});
    }
    return Promise.resolve({});
  });

}

export const clearMocks = () => {
  jest.clearAllMocks();
  jest.resetModules();
};
