Feature: SqsQueue construct

  Scenario: Queue name uses context ID
    Given a context with namespace "7p", stage "prod", name "orders"
    When an SqsQueue construct is created
    Then an SQS Queue exists with QueueName "7p-prod-orders"

  Scenario: FIFO queue name appends .fifo suffix
    Given a context with namespace "7p", stage "prod", name "orders" and fifo true
    When an SqsQueue construct is created
    Then an SQS Queue exists with QueueName "7p-prod-orders.fifo"

  Scenario: DLQ created when dlqEnabled is true
    Given a context with dlqEnabled true
    When an SqsQueue construct is created
    Then two SQS Queue resources exist in the stack

  Scenario: No DLQ when dlqEnabled is false
    Given a context with dlqEnabled false
    When an SqsQueue construct is created
    Then only one SQS Queue resource exists

  Scenario: Context tags applied to queue
    Given a context with tags Env "prod"
    When an SqsQueue construct is created
    Then the SQS queue has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an SqsQueue construct is created
    Then no SQS Queue resources exist in the stack
