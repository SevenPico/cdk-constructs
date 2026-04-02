Feature: IamPolicy construct

  Scenario: Policy name uses context ID
    Given a context with namespace "7p", stage "prod", name "s3-read"
    When an IamPolicy construct is created with iamPolicyEnabled true
    Then an IAM ManagedPolicy exists with ManagedPolicyName "7p-prod-s3-read"

  Scenario: Policy statements added to managed policy
    Given policyStatements with an Allow s3:GetObject on "*"
    When an IamPolicy construct is created with iamPolicyEnabled true
    Then the managed policy document contains the specified statement

  Scenario: Multiple statements combined in policy
    Given two policy statement objects
    When an IamPolicy construct is created with iamPolicyEnabled true
    Then the managed policy document contains both statements

  Scenario: Context tags applied to policy
    Given a context with tags Env "prod"
    When an IamPolicy construct is created with iamPolicyEnabled true
    Then the IAM managed policy has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an IamPolicy construct is created
    Then no IAM ManagedPolicy resources exist in the stack

  Scenario: No resources created when iamPolicyEnabled is false
    Given a context with enabled true
    When an IamPolicy construct is created with iamPolicyEnabled false
    Then no IAM ManagedPolicy resources exist in the stack

  Scenario: JSON output always available
    Given a context with enabled false
    When an IamPolicy construct is created with policyStatements
    Then the json property contains the policy document
