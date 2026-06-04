import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { HttpApiGateway } from '../src/http-api-gateway';

// Shared context matching examples/*/cdk.json
const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

// ---------------------------------------------------------------------------
// Example scenario: minimal
// ---------------------------------------------------------------------------

describe('Example: minimal', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new HttpApiGateway(stack, 'Api', { context: CONTEXT });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 HTTP API', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
  });

  test('API name is derived from context', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'acme-dev-app',
    });
  });

  test('API protocol is HTTP', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      ProtocolType: 'HTTP',
    });
  });

  test('execute endpoint is disabled by default', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      DisableExecuteApiEndpoint: true,
    });
  });

  test('creates a default stage', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Stage', 1);
  });

  test('default stage is named $default', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      StageName: '$default',
    });
  });

  test('creates an access log group', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 1);
  });

  test('log group name matches API name', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/aws/apigateway/acme-dev-app',
    });
  });

  test('log group has 7-day retention by default', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 7,
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: comprehensive
// ---------------------------------------------------------------------------

describe('Example: comprehensive', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new HttpApiGateway(stack, 'Api', {
      context: CONTEXT,
      description: 'Acme HTTP API',
      enableAutoDeploy: true,
      cloudwatchLogsRetentionDays: 30,
      corsConfiguration: {
        allowOrigins: ['https://acme.example.com'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowHeaders: ['Content-Type', 'Authorization'],
        maxAge: 300,
      },
      integrations: {
        lambda: {
          type: 'AWS_PROXY',
          uri: 'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app/invocations',
          payloadFormatVersion: '2.0',
        },
      },
      routes: {
        getItems: {
          routeKey: 'GET /items',
          integrationKey: 'lambda',
          operationName: 'GetItems',
        },
        postItem: {
          routeKey: 'POST /items',
          integrationKey: 'lambda',
          operationName: 'PostItem',
        },
      },
      stageVariables: {
        env: 'dev',
      },
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 HTTP API', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Api', 1);
  });

  test('API description is set', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Description: 'Acme HTTP API',
    });
  });

  test('CORS configuration is set', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      CorsConfiguration: Match.objectLike({
        AllowOrigins: ['https://acme.example.com'],
        MaxAge: 300,
      }),
    });
  });

  test('default stage has auto-deploy enabled', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      AutoDeploy: true,
    });
  });

  test('default stage has stage variables', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      StageVariables: Match.objectLike({ env: 'dev' }),
    });
  });

  test('creates 1 Lambda integration', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Integration', 1);
  });

  test('integration type is AWS_PROXY', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
      IntegrationType: 'AWS_PROXY',
      PayloadFormatVersion: '2.0',
    });
  });

  test('creates 2 routes', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Route', 2);
  });

  test('GET /items route exists', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /items',
      OperationName: 'GetItems',
    });
  });

  test('POST /items route exists', () => {
    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'POST /items',
      OperationName: 'PostItem',
    });
  });

  test('log group has 30-day retention', () => {
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 30,
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new HttpApiGateway(stack, 'Api', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
    });
    template = Template.fromStack(stack);
  });

  test('creates no HTTP APIs when disabled', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Api', 0);
  });

  test('creates no stages when disabled', () => {
    template.resourceCountIs('AWS::ApiGatewayV2::Stage', 0);
  });

  test('creates no log groups when disabled', () => {
    template.resourceCountIs('AWS::Logs::LogGroup', 0);
  });
});
