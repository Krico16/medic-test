process.env.DYNAMODB_TABLE = 'appointment';
process.env.SNS_TOPIC_ARN = 'fake_topic_arn';
process.env.REGION = 'us-east-1';


import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { appointmentHandler } from '../../../../src/handler';
import { clearMocks, mockAwsServices, mockServices } from '../../../util/MockAwsServices';
import { restoreConsole, setUpEnv } from '../../../util/setup';
import { REQUEST_LIST } from '../event/request';
import { RESPONSE_LIST } from '../event/response';

const feature = loadFeature('../generateAppointment.feature', {loadRelativePath: true, errors: true});

jest.mock('@aws-sdk/client-dynamodb')
jest.mock('@aws-sdk/lib-dynamodb', () => {
  return {
    DynamoDBDocument: {
      from: jest.fn().mockImplementation((client) => {
        return {
          send: jest.fn().mockResolvedValue({})
        };
      }),
    },
    PutCommand: jest.fn(),
  }
})
jest.mock('@aws-sdk/client-sns')


defineFeature(feature, test => {
  afterAll(restoreConsole)
  beforeEach(mockAwsServices);
  afterEach(clearMocks);

  test('Generate and appointment for a country', ({given, but, when, then}) => {
    let response: any;
    let requestData: any;

    given(/^I have an appointment request with the data (.*)$/, (request: string) => {
      requestData = REQUEST_LIST[request];
    });

    when('I send a POST request to /appointment', async () => {
      mockServices();
      console.log('WHEN REQUEST', JSON.stringify(requestData));
      const event: APIGatewayProxyEventV2 = {
        rawPath: '/V1/appointment',
        routeKey: 'POST /V1/appointment',
        version: '2.0',
        requestContext: {
          http: {
            method: 'POST',
            path: '/V1/appointment'
          },
          requestId: 'test-request-id'
        } as any,
        headers: {
          'content-type': 'application/json'
        },
        isBase64Encoded: false,
        rawQueryString: '',
        stageVariables: {},
        pathParameters: null,
        queryStringParameters: null,
        cookies: [],
        body: JSON.stringify(requestData)
      };

      response = await appointmentHandler(event);
      console.log('RESPONSE', JSON.stringify(response));
    });

    then(/^The response status code should be (.*) and the response should be (.*)$/, (statusCode, responseKey) => {
      const expectedResponse = RESPONSE_LIST[responseKey];
      console.log('RESPONSE', JSON.stringify(response));
      expect(response.statusCode).toBe(parseInt(statusCode, 10));
      expect(response).toEqual(expectedResponse);
    });
  });

});
