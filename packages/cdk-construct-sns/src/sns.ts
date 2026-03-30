import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { snsProps, SnsOptions } from './sns-fns';

export interface SnsProps extends SnsOptions {
  readonly context: Context;
}

export class Sns extends Construct {
  constructor(scope: Construct, id: string, props: SnsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using snsProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
