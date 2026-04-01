Feature: S3Bucket construct

  Scenario: Bucket name uses context ID
    Given a context with namespace "7p", stage "prod", name "assets"
    When an S3Bucket construct is created
    Then the S3 bucket name is "7p-prod-assets"

  Scenario: Versioning enabled by default
    Given a default context
    When an S3Bucket construct is created
    Then the bucket has versioning enabled

  Scenario: SSE-S3 encryption applied by default
    Given a default context
    When an S3Bucket construct is created
    Then the bucket uses SSE-S3 server-side encryption

  Scenario: KMS encryption when kmsKeyArn provided
    Given a default context with kmsKeyArn "arn:aws:kms:us-east-1:123456789012:key/test-key-id"
    When an S3Bucket construct is created
    Then the bucket uses KMS encryption

  Scenario: All public access blocked by default
    Given a default context
    When an S3Bucket construct is created
    Then all four public access block settings are enabled

  Scenario: Context tags applied to bucket
    Given a context with tags Env "prod"
    When an S3Bucket construct is created
    Then the S3 bucket resource has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an S3Bucket construct is created
    Then no S3 Bucket resources exist in the stack
