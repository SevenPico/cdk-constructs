Feature: Sns construct

  Scenario: Topic name uses context ID
    Given a context with namespace "7p", stage "prod", name "alerts"
    When an Sns construct is created
    Then an SNS Topic exists with TopicName "7p-prod-alerts"

  Scenario: FIFO topic name appends .fifo suffix
    Given a context with namespace "7p", stage "prod", name "alerts" and fifoTopic true
    When an Sns construct is created
    Then an SNS Topic exists with TopicName "7p-prod-alerts.fifo"

  Scenario: DLQ created when sqsDlqEnabled is true
    Given a context with sqsDlqEnabled true
    When an Sns construct is created
    Then an SQS Queue resource exists for dead letter messages

  Scenario: Context tags applied to topic
    Given a context with tags Env "prod"
    When an Sns construct is created
    Then the SNS topic has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an Sns construct is created
    Then no SNS Topic resources exist in the stack
