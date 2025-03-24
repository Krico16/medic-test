export const RESPONSE_LIST = {
  RESPONSE_OK: {
    'statusCode': 200,
    'body': JSON.stringify({
      'code': 0,
      'message': 'success',
      'data': {
        'message': 'Appoinment created successfully'
      }
    }),
    'headers': {
      'Content-Type': 'application/json'
    }
  },
  RESPONSE_ERROR_FORM: {
    'statusCode': 400,
    'body': JSON.stringify({
      'code': 400,
      'message': 'Validation error',
      'data': {
        'issues': [{
          'code': 'invalid_type',
          'expected': 'string',
          'received': 'undefined',
          'path': ['scheduleId', 'centerId'],
          'message': 'Required'
        }],
        'name': 'ZodError'
      }
    }),
    'headers': {
      'Content-Type': 'application/json'
    }
  },
  RESPONSE_ERROR_COUNTRY: {
    headers: {'Content-Type': 'application/json'},
    statusCode: 400,
    body: JSON.stringify({
      'code': 400,
      'message': 'Validation error',
      'data': {
        'issues': [{
          'received': 'CR',
          'code': 'invalid_enum_value',
          'options': ['PE', 'CL'],
          'path': ['countryISO'],
          'message': 'Invalid enum value. Expected \'PE\' | \'CL\', received \'CR\''
        }], 'name': 'ZodError'
      }
    })
  }

};
