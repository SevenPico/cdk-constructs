import { Context, contextId } from '@sevenpico/cdk-context';
import { aws_apigatewayv2 as apigwv2 } from 'aws-cdk-lib';
import { HttpApiCorsConfig, HttpApiGatewayProps } from './http-api-gateway-types';

export const apiName = (ctx: Context, _props: HttpApiGatewayProps): string => contextId(ctx);

export const corsConfigProperty = (cors?: HttpApiCorsConfig): apigwv2.CfnApi.CorsProperty | undefined => {
  if (!cors) return undefined;
  return {
    allowOrigins: cors.allowOrigins,
    allowMethods: cors.allowMethods,
    allowHeaders: cors.allowHeaders,
    exposeHeaders: cors.exposeHeaders,
    maxAge: cors.maxAge,
    allowCredentials: cors.allowCredentials,
  };
};

export const defaultAccessLogFormat = (): string =>
  JSON.stringify({
    requestId: '$context.requestId',
    sourceIp: '$context.identity.sourceIp',
    httpMethod: '$context.httpMethod',
    routeKey: '$context.routeKey',
    status: '$context.status',
    protocol: '$context.protocol',
    responseLength: '$context.responseLength',
    error: '$context.error.message',
  });
