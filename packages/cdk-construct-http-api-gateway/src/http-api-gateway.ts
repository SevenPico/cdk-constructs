import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  RemovalPolicy,
  Tags,
  Fn,
  aws_apigatewayv2 as apigwv2,
  aws_logs as logs,
  aws_route53 as route53,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { corsConfigProperty, defaultAccessLogFormat } from './http-api-gateway-fns';
import { HttpApiGatewayProps } from './http-api-gateway-types';

export class HttpApiGateway extends Construct {
  public readonly api?: apigwv2.CfnApi;
  public readonly logGroup?: logs.LogGroup;
  public readonly customDomain?: apigwv2.CfnDomainName;

  constructor(scope: Construct, id: string, props: HttpApiGatewayProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // Access log group
    let logGroup: logs.LogGroup | undefined;
    if (props.accessLoggingEnabled !== false) {
      logGroup = new logs.LogGroup(this, 'AccessLogs', {
        logGroupName: `/aws/apigateway/${contextId(props.context)}`,
        retention: (props.cloudwatchLogsRetentionDays ?? 7) as logs.RetentionDays,
        removalPolicy: RemovalPolicy.DESTROY,
      });
      this.logGroup = logGroup;
    }

    // HTTP API
    this.api = new apigwv2.CfnApi(this, 'Api', {
      name: contextId(props.context),
      protocolType: 'HTTP',
      description: props.description,
      disableExecuteApiEndpoint: props.disableExecuteApiEndpoint ?? true,
      version: props.apiVersion,
      corsConfiguration: corsConfigProperty(props.corsConfiguration),
    });

    // Default stage
    const stage = new apigwv2.CfnStage(this, 'DefaultStage', {
      apiId: this.api.ref,
      stageName: '$default',
      autoDeploy: props.enableAutoDeploy ?? false,
      stageVariables: props.stageVariables,
      accessLogSettings: logGroup ? {
        destinationArn: logGroup.logGroupArn,
        format: props.accessLogFormat ?? defaultAccessLogFormat(),
      } : undefined,
    });

    // VPC links
    const vpcLinkMap: Record<string, apigwv2.CfnVpcLink> = {};
    Object.entries(props.vpcLinks ?? {}).forEach(([key, vlCfg]) => {
      vpcLinkMap[key] = new apigwv2.CfnVpcLink(this, `VpcLink-${key}`, {
        name: `${contextId(props.context)}-${key}`,
        subnetIds: vlCfg.subnetIds,
        securityGroupIds: vlCfg.securityGroupIds,
      });
    });

    // Integrations
    const integrationMap: Record<string, apigwv2.CfnIntegration> = {};
    Object.entries(props.integrations ?? {}).forEach(([key, intCfg]) => {
      const integrationProps: apigwv2.CfnIntegrationProps = {
        apiId: this.api!.ref,
        integrationType: intCfg.type,
        integrationUri: intCfg.uri,
        credentialsArn: intCfg.credentialsArn,
        integrationMethod: intCfg.method,
        payloadFormatVersion: intCfg.payloadFormatVersion ?? '2.0',
      };
      integrationMap[key] = new apigwv2.CfnIntegration(this, `Integration-${key}`, integrationProps);
    });

    // Routes
    Object.entries(props.routes ?? {}).forEach(([key, routeCfg]) => {
      const integration = integrationMap[routeCfg.integrationKey];
      if (!integration) return;
      new apigwv2.CfnRoute(this, `Route-${key}`, {
        apiId: this.api!.ref,
        routeKey: routeCfg.routeKey,
        target: Fn.join('', ['integrations/', integration.ref]),
        operationName: routeCfg.operationName,
      });
    });

    // Custom domain
    if (props.dnsName && props.acmCertificateArn) {
      this.customDomain = new apigwv2.CfnDomainName(this, 'Domain', {
        domainName: props.dnsName,
        domainNameConfigurations: [{
          certificateArn: props.acmCertificateArn,
          endpointType: 'REGIONAL',
        }],
      });

      new apigwv2.CfnApiMapping(this, 'Mapping', {
        apiId: this.api.ref,
        domainName: this.customDomain.ref,
        stage: stage.ref,
      });

      // Route53 alias records
      (props.route53ZoneIds ?? []).forEach((zoneId, i) => {
        const zone = route53.HostedZone.fromHostedZoneId(this, `Zone${i}`, zoneId);
        new route53.ARecord(this, `DnsAlias${i}`, {
          zone,
          recordName: props.dnsName,
          target: route53.RecordTarget.fromAlias({
            bind: () => ({
              dnsName: this.customDomain!.attrRegionalDomainName,
              hostedZoneId: this.customDomain!.attrRegionalHostedZoneId,
            }),
          }),
        });
      });
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
