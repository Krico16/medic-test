
process.env.DYNAMODB_TABLE = 'appointment';
process.env.SNS_TOPIC_ARN = 'fake_topic_arn';
process.env.REGION = 'us-east-1';


import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { loadFeature, defineFeature } from "jest-cucumber";
import { mocked } from "jest-mock";
import { REQUEST_LIST } from "../event/request";
import { DynamoDBDocument, PutCommand } from "@aws-sdk/lib-dynamodb";
import { PublishCommand } from "@aws-sdk/client-sns";
import { appointmentHandler } from "../../../../src/handler";
import { APIGatewayProxyEventV2 } from "aws-lambda";


const feature = loadFeature('../generateAppointment.feature', { loadRelativePath: true, errors: true });


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

const originalLog = console.log;


defineFeature(feature, test => {

    const mockedDynamoDB = mocked(DynamoDBClient.prototype);
    const mockedDynamoDbLib = mocked(DynamoDBDocument.prototype);
    const mockedSnsClient = mocked(DynamoDBClient.prototype);

    beforeAll(() => {

        console.log = (...args) => {
            originalLog(...args);
        };
    });

    afterAll(() => {
        console.log = originalLog;
    });


    beforeEach(() => {
        jest.clearAllMocks();

        mockedDynamoDB.send.mockResolvedValue({} as never);
        mockedSnsClient.send.mockResolvedValue({ completed: true } as never);
    })

    test('Generate and appointment with valid data for a country', ({ given, but, when, then }) => {
        let response: any;
        let requestData: any;


        given(/^I have a valid appointment request with the data (.*)$/, (request: string) => {
            requestData = REQUEST_LIST[request];
        });


        when('I send a POST request to /appointment', async () => {
            console.log('WHEN REQUEST', JSON.stringify(requestData));
            // Mock DynamoDB responses
            mockedDynamoDB.send.mockImplementation((command) => {
                if (command instanceof PutCommand || command instanceof PutItemCommand) {
                    return Promise.resolve({});
                }
                return Promise.resolve({});
            });
            mockedSnsClient.send.mockImplementation((command) => {
                if (command instanceof PublishCommand) {
                    return Promise.resolve({});
                }
                return Promise.resolve({});
            });
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
                body: JSON.stringify(requestData),
            };

            response = await appointmentHandler(event);
            console.log('RESPONSE', JSON.stringify(response));
        });

        then('the response status code should be 200', () => {
            console.log('RESPONSE', JSON.stringify(response));
            expect(response.statusCode).toBe(200);
        });
    });

})
