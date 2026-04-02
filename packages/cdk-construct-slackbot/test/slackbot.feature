Feature: Slackbot construct

  Scenario: SNS topic created with context-based name
    Given a context with namespace "7p", stage "prod", name "slackbot"
    When a Slackbot construct is created
    Then an SNS topic named "7p-prod-slackbot-notifications" exists

  Scenario: Lambda function subscribes to SNS topic
    Given a valid context, slackChannels, and slackTokenSecretArn
    When a Slackbot construct is created
    Then a Lambda function exists
    And an AWS::SNS::Subscription resource exists with the Lambda as endpoint

  Scenario: Lambda role has GetSecretValue permission
    Given slackTokenSecretArn is set
    When a Slackbot construct is created
    Then the Lambda execution role policy includes secretsmanager:GetSecretValue for that ARN

  Scenario: Lambda role has KMS decrypt permission when kmsKeyArn provided
    Given slackTokenSecretKmsKeyArn is set
    When a Slackbot construct is created
    Then the Lambda execution role policy includes kms:Decrypt for that key ARN

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a Slackbot construct is created
    Then no AWS::SNS::Topic resources exist in the stack
    And no AWS::Lambda::Function resources exist in the stack
