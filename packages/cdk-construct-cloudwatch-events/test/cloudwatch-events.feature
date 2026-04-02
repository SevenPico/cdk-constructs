Feature: CloudWatch Events construct

  Scenario: Rule created with context-derived name
    Given a context with namespace "7p", stage "prod", name "monitor"
    And a rule with name "ec2-state"
    When a CloudwatchEvents construct is created
    Then an AWS::Events::Rule resource exists with Name "7p-prod-monitor-ec2-state"

  Scenario: Scheduled rule created from rate expression
    Given a default context
    And a rule with schedule "rate(5 minutes)"
    When a CloudwatchEvents construct is created
    Then the AWS::Events::Rule has ScheduleExpression "rate(5 minutes)"

  Scenario: SNS target added to rule when type is sns
    Given a default context
    And a rule with an SNS target "arn:aws:sns:us-east-1:123456789012:my-topic"
    When a CloudwatchEvents construct is created
    Then the rule targets contain an entry with Arn referencing the SNS topic

  Scenario: Lambda target added to rule when type is lambda
    Given a default context
    And a rule with a Lambda target "arn:aws:lambda:us-east-1:123456789012:function:my-fn"
    When a CloudwatchEvents construct is created
    Then the rule targets contain an entry referencing the Lambda function

  Scenario: Multiple rules created when multiple rule configs provided
    Given a default context
    And two rule configs
    When a CloudwatchEvents construct is created
    Then two AWS::Events::Rule resources exist in the stack

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    And a rule with name "ec2-state"
    When a CloudwatchEvents construct is created
    Then no AWS::Events::Rule resources exist in the stack
