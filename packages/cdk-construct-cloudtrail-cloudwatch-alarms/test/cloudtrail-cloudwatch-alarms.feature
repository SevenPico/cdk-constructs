Feature: CloudTrail CloudWatch Alarms

  Scenario: All alarms created by default when no enabledAlarms filter
    Given a default context with logGroupName and snsTopicArn
    When a CloudtrailCloudwatchAlarms construct is created
    Then 14 AWS::CloudWatch::Alarm resources exist in the stack
    And 14 AWS::Logs::MetricFilter resources exist in the stack

  Scenario: Only specified alarms created when enabledAlarms provided
    Given a default context with enabledAlarms "root-usage" and "unauthorized-api"
    When a CloudtrailCloudwatchAlarms construct is created
    Then exactly 2 AWS::CloudWatch::Alarm resources exist in the stack
    And exactly 2 AWS::Logs::MetricFilter resources exist in the stack

  Scenario: Each alarm has SNS action pointing to snsTopicArn
    Given a default context with snsTopicArn "arn:aws:sns:us-east-1:123456789012:security-alerts"
    When a CloudtrailCloudwatchAlarms construct is created
    Then every AWS::CloudWatch::Alarm has an AlarmActions entry referencing the SNS ARN

  Scenario: Alarm namespace defaults to CISBenchmark
    Given a default context with no alarmNamespace prop
    When a CloudtrailCloudwatchAlarms construct is created
    Then all metric filters have MetricNamespace "CISBenchmark"

  Scenario: Root account usage alarm uses correct filter pattern
    Given a default context with enabledAlarms "root-usage"
    When a CloudtrailCloudwatchAlarms construct is created
    Then the metric filter FilterPattern includes "$.userIdentity.type"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a CloudtrailCloudwatchAlarms construct is created
    Then no AWS::CloudWatch::Alarm resources exist in the stack
    And no AWS::Logs::MetricFilter resources exist in the stack
