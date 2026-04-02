import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { makeContext } from '@sevenpico/cdk-context';
import { HttpApiGateway } from '../src/http-api-gateway';

describe('HttpApiGateway construct', () => {
  const context = makeContext({ namespace: '7p', stage: 'prod', name: 'api' });

  test('creates no resources when disabled', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context: makeContext({ namespace: '7p', stage: 'prod', name: 'api', enabled: false }),
    });
    expect(Object.keys(Template.fromStack(stack).toJSON().Resources ?? {})).toHaveLength(0);
  });

  test('creates HTTP API with context ID as name', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', { context });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: '7p-prod-api',
      ProtocolType: 'HTTP',
    });
  });

  test('disables execute-api endpoint by default', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', { context });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      DisableExecuteApiEndpoint: true,
    });
  });

  test('creates access log group by default', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', { context });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: '/aws/apigateway/7p-prod-api',
      RetentionInDays: 7,
    });
  });

  test('no access log group when disabled', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      accessLoggingEnabled: false,
    });
    const template = Template.fromStack(stack);
    expect(template.findResources('AWS::Logs::LogGroup')).toEqual({});
  });

  test('custom log retention days', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      cloudwatchLogsRetentionDays: 30,
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Logs::LogGroup', {
      RetentionInDays: 30,
    });
  });

  test('creates default stage', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', { context });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      StageName: '$default',
      AutoDeploy: false,
    });
  });

  test('creates integration', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      integrations: {
        myLambda: {
          type: 'AWS_PROXY',
          uri: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
        },
      },
      routes: {
        getItems: {
          routeKey: 'GET /items',
          integrationKey: 'myLambda',
        },
      },
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
      IntegrationType: 'AWS_PROXY',
      IntegrationUri: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
      PayloadFormatVersion: '2.0',
    });
    template.hasResourceProperties('AWS::ApiGatewayV2::Route', {
      RouteKey: 'GET /items',
    });
  });

  test('creates HTTP URL integration', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      integrations: {
        backend: {
          type: 'HTTP_PROXY',
          uri: 'https://backend.example.com',
        },
      },
      routes: {
        proxy: {
          routeKey: 'ANY /proxy',
          integrationKey: 'backend',
        },
      },
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
      IntegrationType: 'HTTP_PROXY',
      IntegrationUri: 'https://backend.example.com',
    });
  });

  test('creates custom domain and API mapping', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      dnsName: 'api.example.com',
      acmCertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/abc-123',
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::DomainName', {
      DomainName: 'api.example.com',
      DomainNameConfigurations: [{
        CertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/abc-123',
        EndpointType: 'REGIONAL',
      }],
    });
    template.resourceCountIs('AWS::ApiGatewayV2::ApiMapping', 1);
  });

  test('sets description on API', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      description: 'My HTTP API',
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Description: 'My HTTP API',
    });
  });

  test('configures CORS', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      corsConfiguration: {
        allowOrigins: ['https://example.com'],
        allowMethods: ['GET', 'POST'],
        allowHeaders: ['Content-Type'],
        maxAge: 300,
      },
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      CorsConfiguration: {
        AllowOrigins: ['https://example.com'],
        AllowMethods: ['GET', 'POST'],
        AllowHeaders: ['Content-Type'],
        MaxAge: 300,
      },
    });
  });

  test('exposes api property', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const gw = new HttpApiGateway(stack, 'SUT', { context });
    expect(gw.api).toBeDefined();
  });

  test('exposes logGroup property', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const gw = new HttpApiGateway(stack, 'SUT', { context });
    expect(gw.logGroup).toBeDefined();
  });

  test('exposes customDomain as undefined when not configured', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    const gw = new HttpApiGateway(stack, 'SUT', { context });
    expect(gw.customDomain).toBeUndefined();
  });

  test('payload format version 1.0 for integration', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      integrations: {
        myLambda: {
          type: 'AWS_PROXY',
          uri: 'arn:aws:lambda:us-east-1:123456789012:function:my-fn',
          payloadFormatVersion: '1.0',
        },
      },
      routes: {
        getItems: {
          routeKey: 'GET /items',
          integrationKey: 'myLambda',
        },
      },
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Integration', {
      PayloadFormatVersion: '1.0',
    });
  });

  test('skips routes with missing integration key', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      routes: {
        orphan: {
          routeKey: 'GET /missing',
          integrationKey: 'nonexistent',
        },
      },
    });
    const template = Template.fromStack(stack);
    expect(template.findResources('AWS::ApiGatewayV2::Route')).toEqual({});
  });

  test('creates VPC link', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      vpcLinks: {
        myVpc: {
          subnetIds: ['subnet-aaa', 'subnet-bbb'],
          securityGroupIds: ['sg-111'],
        },
      },
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::VpcLink', {
      Name: '7p-prod-api-myVpc',
      SubnetIds: ['subnet-aaa', 'subnet-bbb'],
      SecurityGroupIds: ['sg-111'],
    });
  });

  test('auto deploy enabled', () => {
    const app = new App();
    const stack = new Stack(app, 'Test');
    new HttpApiGateway(stack, 'SUT', {
      context,
      enableAutoDeploy: true,
    });
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      AutoDeploy: true,
    });
  });
});
