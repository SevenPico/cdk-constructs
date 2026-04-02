Feature: HTTP API Gateway

  Scenario: API name uses context ID
    Given a context with namespace "7p", stage "prod", name "api"
    When an HttpApiGateway is created
    Then the HTTP API name is "7p-prod-api"

  Scenario: Access log group created by default
    Given a context with namespace "7p", stage "prod", name "api"
    And no accessLoggingEnabled prop
    When an HttpApiGateway is created
    Then a CloudWatch log group exists at "/aws/apigateway/7p-prod-api"

  Scenario: No access log group when disabled
    Given a context with namespace "7p", stage "prod", name "api"
    And accessLoggingEnabled is false
    When an HttpApiGateway is created
    Then no AWS::Logs::LogGroup resource exists for the API

  Scenario: Custom domain mapping created when dnsName and cert provided
    Given a context with namespace "7p", stage "prod", name "api"
    And dnsName is "api.example.com" and acmCertificateArn is provided
    When an HttpApiGateway is created
    Then an AWS::ApiGatewayV2::DomainName resource exists
    And an AWS::ApiGatewayV2::ApiMapping resource exists

  Scenario: No resources created when context is disabled
    Given a context with enabled false
    When an HttpApiGateway is created
    Then no AWS::ApiGatewayV2::Api resources exist in the stack

  Scenario: Lambda integration with route
    Given a context with namespace "7p", stage "prod", name "api"
    And an AWS_PROXY integration with a Lambda ARN
    And a route "GET /items" referencing that integration
    When an HttpApiGateway is created
    Then an AWS::ApiGatewayV2::Integration resource exists with type AWS_PROXY
    And an AWS::ApiGatewayV2::Route resource exists with route key "GET /items"
