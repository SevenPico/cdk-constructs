import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { dynamodbProps, DynamodbOptions } from './dynamodb-fns';

export interface DynamodbProps extends DynamodbOptions {
  readonly context: Context;
}

export class Dynamodb extends Construct {
  constructor(scope: Construct, id: string, props: DynamodbProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using dynamodbProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
