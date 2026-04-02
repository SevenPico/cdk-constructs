Feature: SfnErrorNotification construct

  Scenario: DLQ name derived from context with dlq attribute
    Given a context with namespace "7p", stage "prod", name "workflow"
    When a SfnErrorNotification is created
    Then an SQS queue named "7p-prod-workflow-dlq" exists

  Scenario: EventBridge rule captures FAILED, TIMED_OUT, and ABORTED executions
    Given a valid context and stateMachineArn
    When a SfnErrorNotification is created
    Then an EventBridge rule exists with detail matching status FAILED, TIMED_OUT, ABORTED
    And the rule target is the DLQ

  Scenario: Standard SFN alarms use 2 datapoints over 2 periods
    Given a valid context
    When a SfnErrorNotification is created without alarm config
    Then both alarms have datapointsToAlarm 2 and evaluationPeriods 2

  Scenario: EventBridge Pipe routes DLQ messages back to state machine
    Given a valid context and stateMachineArn
    When a SfnErrorNotification is created
    Then a AWS::Pipes::Pipe exists with source as DLQ and target as state machine ARN

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a SfnErrorNotification is created
    Then no resources of any type exist in the stack
