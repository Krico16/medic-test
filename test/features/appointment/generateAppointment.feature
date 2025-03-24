Feature: API POST /appointment

  Scenario Outline: Generate and appointment for a country
    Given I have an appointment request with the data <request>
    When I send a POST request to /appointment
    Then The response status code should be <statusCode> and the response should be <response>

    Examples:
      | request                 | statusCode | response               |
      | REQUEST_VALID_PE        | 200        | RESPONSE_OK            |
      | REQUEST_VALID_CL        | 200        | RESPONSE_OK            |
      | REQUEST_INVALID_FORM    | 400        | RESPONSE_ERROR_FORM    |
      | REQUEST_INVALID_COUNTRY | 400        | RESPONSE_ERROR_COUNTRY |
