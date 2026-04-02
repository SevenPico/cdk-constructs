Feature: CloudwatchFlowLogs construct

  Scenario: Log group created with VPC-derived name
    Given a context with namespace "7p", stage "prod", name "network"
    When a CloudwatchFlowLogs construct is created
    Then an AWS::Logs::LogGroup resource exists with LogGroupName "/aws/vpc/flowlogs/7p-prod-network"

  Scenario: Log retention defaults to 365 days
    Given a context with namespace "7p", stage "prod", name "network"
    When a CloudwatchFlowLogs construct is created with no cloudwatchLogRetentionDays
    Then the log group has RetentionInDays 365

  Scenario: KMS encryption applied to log group when logGroupKmsKeyArn provided
    Given a context with namespace "7p", stage "prod", name "network"
    When a CloudwatchFlowLogs construct is created with logGroupKmsKeyArn "arn:aws:kms:us-east-1:123456789012:key/abc"
    Then the log group has KmsKeyId set to that key ARN

  Scenario: Traffic type defaults to ALL
    Given a context with namespace "7p", stage "prod", name "network"
    When a CloudwatchFlowLogs construct is created with no trafficType
    Then the flow log has TrafficType "ALL"

  Scenario: IAM role created with CloudWatch Logs permissions
    Given a context with namespace "7p", stage "prod", name "network"
    When a CloudwatchFlowLogs construct is created
    Then an AWS::IAM::Role resource exists with trust policy allowing "vpc-flow-logs.amazonaws.com"
    And the role policy includes "logs:PutLogEvents" on "*"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a CloudwatchFlowLogs construct is created
    Then no AWS::Logs::LogGroup resources exist in the stack
    And no AWS::EC2::FlowLog resources exist in the stack
    And no AWS::IAM::Role resources exist in the stack
