Feature: Weather-aware delivery delay processing

  Scenario: Weather requests start concurrently
    Given four orders
    When the batch starts
    Then all four city lookups are in flight before the batch completes

  Scenario Outline: Golden-flow weather causes delay
    Given an order whose weather main status is <status>
    When the order is processed
    Then its status is Delayed

    Examples:
      | status  |
      | Rain    |
      | Snow    |
      | Extreme |

  Scenario: Invalid city does not stop valid cities
    Given three valid cities and InvalidCity123
    When the batch is processed
    Then the invalid city error is logged
    And the three valid city results are written
    And the process completes without a fatal error
