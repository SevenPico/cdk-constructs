Feature: ExpressSfnErrorNotification construct

  Scenario: One DLQ created per step function
    Given a context and stepFunctions map with two entries orderProcessor and paymentProcessor
    When an ExpressSfnErrorNotification is created
    Then two SQS queues are created in the stack

  Scenario: DLQ names include machine key
    Given a context with namespace "7p", stage "prod", name "monitor"
    And a stepFunctions entry with key "orders"
    When an ExpressSfnErrorNotification is created
    Then the DLQ name is "7p-prod-monitor-orders-dlq"

  Scenario: One pipe created per step function
    Given a stepFunctions map with two entries
    When an ExpressSfnErrorNotification is created
    Then two AWS::Pipes::Pipe resources exist

  Scenario: Alarms use lighter thresholds 1 datapoint 5 periods
    Given a valid context with no alarm config
    When an ExpressSfnErrorNotification is created
    Then all alarms have datapointsToAlarm 1 and evaluationPeriods 5

  Scenario: Express alarms use 30-second visibility timeout
    Given no sqsVisibilityTimeoutSeconds override
    When an ExpressSfnErrorNotification is created
    Then all DLQs have visibility timeout of 30 seconds

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an ExpressSfnErrorNotification is created
    Then no resources of any type exist in the stack
