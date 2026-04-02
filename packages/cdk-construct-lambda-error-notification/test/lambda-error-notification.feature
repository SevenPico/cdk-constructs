Feature: LambdaErrorNotification construct

  Scenario: DLQ is created with context-based name
    Given a context with namespace "7p", stage "prod", name "processor"
    When a LambdaErrorNotification is created
    Then an SQS queue named "7p-prod-processor-dlq" exists

  Scenario: DLQ uses 7-day retention by default
    Given a valid context
    When a LambdaErrorNotification is created with no sqsMessageRetentionSeconds
    Then the DLQ message retention period is 604800 seconds

  Scenario: Both rate and volume alarms are created
    Given a valid context, rateAlarmSnsTopicArn, and volumeAlarmSnsTopicArn
    When a LambdaErrorNotification is created
    Then a CloudWatch alarm for DLQ rate exists
    And a CloudWatch alarm for DLQ volume exists

  Scenario: EventBridge Pipe is created to reprocess DLQ messages
    Given a valid context and lambdaArn
    When a LambdaErrorNotification is created
    Then a AWS::Pipes::Pipe resource exists with source set to the DLQ ARN

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a LambdaErrorNotification is created
    Then no AWS::SQS::Queue resources exist in the stack
    And no AWS::CloudWatch::Alarm resources exist in the stack
    And no AWS::Pipes::Pipe resources exist in the stack
