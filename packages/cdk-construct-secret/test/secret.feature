Feature: Secret construct

  Scenario: Secret name uses context ID with secret suffix
    Given a context with namespace "7p", stage "prod", name "db-password"
    When a Secret construct is created
    Then an AWS SecretsManager Secret resource exists with name "7p-prod-db-password-secret"

  Scenario: KMS key created by default
    Given a context with namespace "7p", stage "prod", name "db-password"
    When a Secret construct is created with defaults
    Then a KMS Key resource exists
    And a KMS Alias "alias/7p-prod-db-password-key" exists

  Scenario: Secret encrypted with provided KMS key ARN
    Given a context with namespace "7p", stage "prod", name "db-password"
    When a Secret construct is created with createKmsKey false and kmsKeyArn "arn:aws:kms:us-east-1:123456789012:key/test-key-id"
    Then the secret is encrypted with the specified KMS key ARN
    And no KMS Key resources are created

  Scenario: Initial secret string provided
    Given a context with namespace "7p", stage "prod", name "db-password"
    When a Secret construct is created with secretString "initial-value"
    Then the secret resource has a SecretString configured

  Scenario: Context tags applied to secret
    Given a context with namespace "7p", stage "prod", name "db-password" and tags Env "prod"
    When a Secret construct is created
    Then the secret resource has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a Secret construct is created
    Then no SecretsManager Secret resources exist in the stack
    And no KMS Key resources exist in the stack
