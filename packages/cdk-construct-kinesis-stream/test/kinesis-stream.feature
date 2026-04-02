Feature: Kinesis Stream Construct
  As an infrastructure engineer
  I want to provision an AWS Kinesis Data Stream
  So that I can ingest and process real-time streaming data

  @enabled:false
  Scenario: Stream uses context ID as name
    Given a context with namespace "7p", stage "prod", name "events"
    When a KinesisStream is created
    Then the Kinesis stream name is "7p-prod-events"

  @enabled:false
  Scenario: Provisioned mode with 1 shard by default
    Given a context with no streamMode prop
    When a KinesisStream is created
    Then the stream mode is "PROVISIONED" with shard count 1

  @enabled:false
  Scenario: ON_DEMAND mode ignores shard count
    Given streamMode "ON_DEMAND" and shardCount 10
    When a KinesisStream is created
    Then the stream mode is "ON_DEMAND" and no shard count is set

  @enabled:false
  Scenario: KMS encryption enabled by default
    Given a context with no encryptionType prop
    When a KinesisStream is created
    Then the stream encryption type is "KMS"

  @enabled:false
  Scenario: No encryption when NONE specified
    Given encryptionType "NONE"
    When a KinesisStream is created
    Then the stream has no KMS encryption

  @enabled:false
  Scenario: Registered consumers created when consumerCount > 0
    Given consumerCount 2
    When a KinesisStream is created
    Then two AWS::Kinesis::StreamConsumer resources exist

  @enabled:false
  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a KinesisStream is created
    Then no AWS::Kinesis::Stream resources exist in the stack
