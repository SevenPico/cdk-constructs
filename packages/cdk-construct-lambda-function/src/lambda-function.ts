import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { lambdaFunctionProps, LambdaFunctionOptions } from './lambda-function-fns';

export interface LambdaFunctionProps extends LambdaFunctionOptions {
  readonly context: Context;
}

export class LambdaFunction extends Construct {
  constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using lambdaFunctionProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
