Feature: SES Domain Identity Construct
  As an infrastructure engineer
  I want to provision an SES domain identity with DNS verification and IAM resources
  So that I can send email from a verified domain with proper access controls

  @enabled:false
  Scenario: Domain identity created with context ID
    Given a context with id "mail-prod-example-com"
    When a Ses construct is created
    Then a AWS::SES::EmailIdentity resource exists with emailIdentity "mail-prod-example-com"

  @enabled:false
  Scenario: TXT verification record created when verifyDomain is true
    Given verifyDomain true and a zoneId
    When a Ses construct is created
    Then a AWS::Route53::RecordSet TXT record exists for domain verification

  @enabled:false
  Scenario: No DNS records created when verifyDomain is false
    Given verifyDomain false
    When a Ses construct is created
    Then no Route53 record sets exist for SES verification

  @enabled:false
  Scenario: IAM group created with SES send permissions by default
    Given no sesGroupEnabled prop
    When a Ses construct is created
    Then an AWS::IAM::Group resource exists
    And the group policy includes ses:SendRawEmail

  @enabled:false
  Scenario: No IAM group when sesGroupEnabled is false
    Given sesGroupEnabled false
    When a Ses construct is created
    Then no AWS::IAM::Group resource exists

  @enabled:false
  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When a Ses construct is created
    Then no AWS::SES::EmailIdentity resources exist in the stack
