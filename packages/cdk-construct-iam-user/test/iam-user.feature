Feature: IamUser construct

  Scenario: User name set from props
    Given a context and userName "ci-deploy@example.com"
    When an IamUser construct is created
    Then an IAM User exists with UserName "ci-deploy@example.com"

  Scenario: User added to group when groups provided
    Given groups ["developers"]
    When an IamUser construct is created
    Then the user is added to the "developers" group

  Scenario: Permissions boundary attached when provided
    Given permissionsBoundary "arn:aws:iam::123456789012:policy/Boundary"
    When an IamUser construct is created
    Then the user has the specified permissions boundary

  Scenario: Login profile enabled by default
    Given no explicit loginProfileEnabled
    When an IamUser construct is created
    Then the CfnUser has a LoginProfile with PasswordResetRequired true

  Scenario: Login profile disabled when loginProfileEnabled is false
    Given loginProfileEnabled false
    When an IamUser construct is created
    Then the CfnUser has no LoginProfile

  Scenario: Context tags applied to user
    Given a context with tags Env "prod"
    When an IamUser construct is created
    Then the IAM user has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an IamUser construct is created
    Then no IAM User resources exist in the stack
