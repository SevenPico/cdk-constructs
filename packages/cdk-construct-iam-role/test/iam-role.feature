Feature: IamRole construct

  Scenario: Role name uses context ID
    Given a context with namespace "7p", stage "prod", name "lambda"
    When an IamRole construct is created
    Then an IAM Role exists with RoleName "7p-prod-lambda"

  Scenario: Lambda service principal in assume role policy
    Given a context with principals Service "lambda.amazonaws.com"
    When an IamRole construct is created
    Then the role trust policy allows "lambda.amazonaws.com"

  Scenario: Managed policy attached when managedPolicyArns provided
    Given a context with managed policy "arn:aws:iam::aws:policy/ReadOnlyAccess"
    When an IamRole construct is created
    Then the role has the managed policy attached

  Scenario: Context tags applied to role
    Given a context with tags Env "prod"
    When an IamRole construct is created
    Then the IAM role has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an IamRole construct is created
    Then no IAM Role resources exist in the stack
