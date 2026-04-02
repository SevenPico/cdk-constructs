Feature: Step Functions Construct
  As an infrastructure engineer
  I want to provision an AWS Step Functions state machine
  So that I can orchestrate serverless workflows with proper logging and IAM

  @enabled:false
  Scenario: State machine uses context ID as name
    Given a context with namespace "7p", stage "prod", name "workflow"
    When a StepFunctions construct is created
    Then the state machine name is "7p-prod-workflow"

  @enabled:false
  Scenario: Custom state machine name overrides context ID
    Given a context and stateMachineName "my-workflow"
    When a StepFunctions construct is created
    Then the state machine name is "my-workflow"

  @enabled:false
  Scenario: Standard state machine created by default
    Given a valid context with no type prop
    When a StepFunctions construct is created
    Then the state machine type is "STANDARD"

  @enabled:false
  Scenario: Express state machine created when type is EXPRESS
    Given a valid context and type "EXPRESS"
    When a StepFunctions construct is created
    Then the state machine type is "EXPRESS"

  @enabled:false
  Scenario: CloudWatch log group created by default
    Given a valid context with no existingLogGroupArn
    When a StepFunctions construct is created
    Then a log group named "/aws/states/7p-prod-workflow" exists

  @enabled:false
  Scenario: Existing log group used when ARN provided
    Given an existingLogGroupArn is provided
    When a StepFunctions construct is created
    Then no new AWS::Logs::LogGroup resource is created for the state machine

  @enabled:false
  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a StepFunctions construct is created
    Then no AWS::StepFunctions::StateMachine resources exist in the stack
