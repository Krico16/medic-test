const originalLog = console.log;

export const setUpEnv = () => {
  process.env.DYNAMODB_TABLE = 'appointment';
  process.env.SNS_TOPIC_ARN = 'fake_topic_arn';
  process.env.REGION = 'us-east-1';

  console.log = (...args) => {
    originalLog(...args);
  };

};

export const restoreConsole = () => {
  console.log = originalLog;
};
