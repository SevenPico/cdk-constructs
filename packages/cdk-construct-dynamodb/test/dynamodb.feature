Feature: DynamoDB Table Construct
  As an infrastructure engineer
  I want to provision a DynamoDB table with configurable options
  So that I can store data with consistent naming and encryption

  @enabled:false
  Scenario: Table uses context ID as name
    Given a context with namespace "7p", stage "prod", name "orders"
    When a Dynamodb is created with hashKey "id"
    Then the table name is "7p-prod-orders"

  @enabled:false
  Scenario: Provisioned billing with default capacity
    Given no billingMode prop
    When a Dynamodb is created
    Then the billing mode is PROVISIONED with read capacity 5 and write capacity 5

  @enabled:false
  Scenario: PAY_PER_REQUEST mode has no capacity units
    Given billingMode "PAY_PER_REQUEST"
    When a Dynamodb is created
    Then no read or write capacity units are set

  @enabled:false
  Scenario: Point-in-time recovery enabled by default
    Given no enablePointInTimeRecovery prop
    When a Dynamodb is created
    Then point-in-time recovery is enabled

  @enabled:false
  Scenario: TTL enabled with Expires attribute by default
    Given no ttlEnabled or ttlAttribute props
    When a Dynamodb is created
    Then TTL is enabled on the "Expires" attribute

  @enabled:false
  Scenario: Encryption enabled by default
    Given no enableEncryption prop
    When a Dynamodb is created
    Then the table uses AWS-managed encryption

  @enabled:false
  Scenario: GSI added to table
    Given a globalSecondaryIndexes config with one GSI
    When a Dynamodb is created
    Then the table has one global secondary index

  @enabled:false
  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a Dynamodb is created
    Then no AWS::DynamoDB::Table resources exist in the stack
