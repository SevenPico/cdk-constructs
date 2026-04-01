Feature: Lambda Function Construct

  Scenario: Function uses context ID as name by default
    Given a context with namespace "7p", stage "prod", name "processor"
    When a LambdaFunction is created without explicit functionName
    Then the Lambda function name is "7p-prod-processor"

  Scenario: Custom function name overrides context ID
    Given a context with namespace "7p", stage "prod", name "processor"
    And functionName is set to "my-custom-function"
    When a LambdaFunction is created
    Then the Lambda function name is "my-custom-function"

  Scenario: CloudWatch log group is always created
    Given a valid context and function code
    When a LambdaFunction is created
    Then a CloudWatch log group exists

  Scenario: IAM execution role is created with Lambda trust
    Given a valid context and function code
    When a LambdaFunction is created
    Then an IAM role exists with trust policy allowing "lambda.amazonaws.com"

  Scenario: VPC access policy added when VPC config provided
    Given a context and a vpcConfig with security group and subnet IDs
    When a LambdaFunction is created
    Then the execution role has the "AWSLambdaVPCAccessExecutionRole" managed policy

  Scenario: X-Ray write policy added when tracingMode is Active
    Given a context and tracingMode set to "Active"
    When a LambdaFunction is created
    Then the execution role has the "AWSXRayDaemonWriteAccess" managed policy

  Scenario: No resources created when context is disabled
    Given a context with enabled set to false
    When a LambdaFunction is created
    Then no AWS Lambda Function resources exist in the stack
    And no AWS IAM Role resources exist in the stack
