import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { httpApiGatewayProps, HttpApiGatewayOptions } from './http-api-gateway-fns';

export interface HttpApiGatewayProps extends HttpApiGatewayOptions {
  readonly context: Context;
}

export class HttpApiGateway extends Construct {
  constructor(scope: Construct, id: string, props: HttpApiGatewayProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using httpApiGatewayProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
