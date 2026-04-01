Feature: KmsKey construct

  Scenario: Alias defaults to context ID
    Given a context with namespace "7p", stage "prod", name "secrets"
    When a KmsKey construct is created with no alias prop
    Then a KMS alias "alias/7p-prod-secrets" exists

  Scenario: Custom alias overrides default
    Given a context with namespace "7p", stage "prod", name "secrets"
    When a KmsKey construct is created with alias "alias/my-custom-key"
    Then a KMS alias "alias/my-custom-key" exists

  Scenario: Key rotation enabled by default
    Given a context with namespace "7p", stage "prod", name "secrets"
    When a KmsKey construct is created with defaults
    Then the KMS key has key rotation enabled

  Scenario: Pending window defaults to 10 days
    Given a context with namespace "7p", stage "prod", name "secrets"
    When a KmsKey construct is created with defaults
    Then the pending deletion window is 10 days

  Scenario: Removal policy is RETAIN
    Given a context with namespace "7p", stage "prod", name "secrets"
    When a KmsKey construct is created with defaults
    Then the KMS key has DeletionPolicy Retain

  Scenario: Context tags applied to key
    Given a context with namespace "7p", stage "prod", name "secrets" and tags Env "prod"
    When a KmsKey construct is created
    Then the KMS key resource has the tag Env "prod"

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a KmsKey construct is created
    Then no KMS Key resources exist in the stack
    And no KMS Alias resources exist in the stack
