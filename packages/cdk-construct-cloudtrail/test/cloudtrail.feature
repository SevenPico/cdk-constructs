@enabled:false
Feature: CloudTrail construct

  Scenario: Trail created with context-based name
    Given a context with namespace "7p", stage "prod", name "audit"
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then an AWS::CloudTrail::Trail resource exists with TrailName "7p-prod-audit"

  Scenario: Multi-region trail enabled by default
    Given a default context
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then the trail has IsMultiRegionTrail true

  Scenario: Log file validation enabled by default
    Given a default context
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then the trail has EnableLogFileValidation true

  Scenario: Global service events included by default
    Given a default context
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then the trail has IncludeGlobalServiceEvents true

  Scenario: CloudWatch log group created when cloudWatchLogsEnabled is true
    Given a default context with cloudWatchLogsEnabled true
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then an AWS::Logs::LogGroup resource exists
    And the trail has a CloudWatchLogsLogGroupArn

  Scenario: No CloudWatch log group when cloudWatchLogsEnabled is false
    Given a default context
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then no AWS::Logs::LogGroup resources exist in the stack

  Scenario: Data event selector added when dataEvents provided
    Given a default context with S3 data events
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then the trail has an EventSelector for S3 objects

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a CloudTrail construct is created with s3BucketName "my-trail-bucket"
    Then no AWS::CloudTrail::Trail resources exist in the stack
    And no AWS::Logs::LogGroup resources exist in the stack
