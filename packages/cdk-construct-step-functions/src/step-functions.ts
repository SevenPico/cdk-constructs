import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { Context, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { stepFunctionsProps, StepFunctionsOptions } from './step-functions-fns';

export interface StepFunctionsProps extends StepFunctionsOptions {
  readonly context: Context;
}

export class StepFunctions extends Construct {
  constructor(scope: Construct, id: string, props: StepFunctionsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // TODO: create AWS resources using stepFunctionsProps(props.context, props)
    Object.entries(contextTags(props.context))
      .forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
