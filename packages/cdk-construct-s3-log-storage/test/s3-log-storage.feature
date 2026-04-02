Feature: S3LogStorage construct

  Scenario: Log bucket name uses context ID
    Given a context with namespace "7p", stage "prod", name "logs"
    When an S3LogStorage construct is created
    Then the S3 bucket name is "7p-prod-logs"

  Scenario: Bucket versioning is enabled by default
    Given a valid context
    When an S3LogStorage construct is created
    Then the bucket has versioning enabled

  Scenario: SSL-only requests enforced by default
    Given a valid context
    When an S3LogStorage construct is created
    Then the bucket policy denies non-SSL requests

  Scenario: All public access blocks enabled by default
    Given a valid context
    When an S3LogStorage construct is created
    Then BlockPublicAcls, BlockPublicPolicy, IgnorePublicAcls, RestrictPublicBuckets are all true

  Scenario: Context tags applied to log bucket
    Given a context with tags
    When an S3LogStorage construct is created
    Then the S3 bucket resource has those tags

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an S3LogStorage construct is created
    Then no AWS::S3::Bucket resources exist in the stack

  Scenario: Object ownership defaults to ObjectWriter
    Given a valid context
    When an S3LogStorage construct is created
    Then the bucket has ObjectOwnership set to ObjectWriter
