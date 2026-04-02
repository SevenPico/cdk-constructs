Feature: EventBridge Construct
  As an infrastructure engineer
  I want to provision a custom Amazon EventBridge event bus
  So that I can route events between services with consistent naming and policies

  @enabled:false
  Scenario: Event bus uses context ID as name by default
    Given a context with namespace "7p", stage "prod", name "platform"
    When an Eventbridge construct is created
    Then the event bus name is "7p-prod-platform"

  @enabled:false
  Scenario: Custom name overrides context ID
    Given eventBusName "my-bus"
    When an Eventbridge construct is created
    Then the event bus name is "my-bus"

  @enabled:false
  Scenario: Resource policy attached when policyDocument provided
    Given a policyDocument JSON string with valid IAM statements
    When an Eventbridge construct is created
    Then a AWS::Events::EventBusPolicy resource exists

  @enabled:false
  Scenario: No policy resource when policyDocument not provided
    Given no policyDocument prop
    When an Eventbridge construct is created
    Then no AWS::Events::EventBusPolicy resource exists

  @enabled:false
  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an Eventbridge construct is created
    Then no AWS::Events::EventBus resources exist in the stack
