Feature: API POST /appointment

  Scenario Outline: Generate and appointment with valid data for a country
    Given I have a valid appointment request with the data <request>
    When I send a POST request to /appointment
    Then the response status code should be 200

    Examples:
      | request          | response    |
      | REQUEST_VALID_PE | RESPONSE_OK |
      | REQUEST_VALID_CL | RESPONSE_OK |
