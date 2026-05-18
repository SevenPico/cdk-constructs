import { Context } from '@sevenpico/cdk-context';

export interface HttpApiRoute {
  readonly routeKey: string;
  readonly integrationKey: string;
  readonly authorizerKey?: string;
  readonly operationName?: string;
}

export interface HttpApiIntegration {
  readonly type: string;
  readonly uri?: string;
  readonly credentialsArn?: string;
  readonly method?: string;
  readonly payloadFormatVersion?: string;
}

export interface HttpApiAuthorizer {
  readonly type: string;
  readonly jwtIssuer?: string;
  readonly jwtAudience?: string[];
  readonly lambdaArn?: string;
  readonly identitySources?: string[];
}

export interface HttpApiVpcLink {
  readonly subnetIds: string[];
  readonly securityGroupIds?: string[];
}

export interface HttpApiCorsConfig {
  readonly allowOrigins?: string[];
  readonly allowMethods?: string[];
  readonly allowHeaders?: string[];
  readonly exposeHeaders?: string[];
  readonly maxAge?: number;
  readonly allowCredentials?: boolean;
}

export interface HttpApiStageConfig {
  readonly stageName: string;
  readonly autoDeploy?: boolean;
}

export interface HttpApiGatewayProps {
  readonly context: Context;
  readonly description?: string;
  readonly disableExecuteApiEndpoint?: boolean;
  readonly apiVersion?: string;
  readonly corsConfiguration?: HttpApiCorsConfig;
  readonly routes?: Record<string, HttpApiRoute>;
  readonly integrations?: Record<string, HttpApiIntegration>;
  readonly authorizers?: Record<string, HttpApiAuthorizer>;
  readonly vpcLinks?: Record<string, HttpApiVpcLink>;
  readonly dnsName?: string;
  readonly route53ZoneIds?: string[];
  readonly acmCertificateArn?: string;
  readonly enableAutoDeploy?: boolean;
  readonly stageVariables?: Record<string, string>;
  readonly accessLoggingEnabled?: boolean;
  readonly accessLogFormat?: string;
  readonly cloudwatchLogsRetentionDays?: number;
  /** Pre-parsed OpenAPI 3.x spec object. When provided, routes and integrations
   *  are sourced from the spec; the `routes` and `integrations` props are ignored. */
  readonly openApiBody?: object;
  /** Additional stages to create (e.g., prod, staging). $default stage is always created. */
  readonly stages?: HttpApiStageConfig[];
}
