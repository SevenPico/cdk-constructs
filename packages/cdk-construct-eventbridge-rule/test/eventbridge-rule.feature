Feature: EventBridge Rule Construct
  As an infrastructure engineer
  I want to provision an EventBridge rule with a target
  So that I can route events to downstream services

  @enabled:false
  Scenario: Rule uses context ID as name
    Given a context with namespace "7p", stage "prod", name "s3events"
    When an EventbridgeRule is created
    Then the EventBridge rule name is "7p-prod-s3events"

  @enabled:false
  Scenario: Rule is enabled by default
    Given no ruleEnabled prop
    When an EventbridgeRule is created
    Then the rule state is "ENABLED"

  @enabled:false
  Scenario: Rule can be disabled via prop
    Given ruleEnabled false
    When an EventbridgeRule is created
    Then the rule state is "DISABLED"

  @enabled:false
  Scenario: Event pattern is applied to the rule
    Given eventPattern { source: ['aws.s3'] }
    When an EventbridgeRule is created
    Then the rule event pattern includes source "aws.s3"

  @enabled:false
  Scenario: Target ID defaults to context ID + suffix
    Given a context with id "7p-prod-s3events" and no targetId prop
    When an EventbridgeRule is created
    Then the rule target ID is "7p-prod-s3events-target"

  @enabled:false
  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an EventbridgeRule is created
    Then no AWS::Events::Rule resources exist in the stack
