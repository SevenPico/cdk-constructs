import { Construct } from 'constructs';
import {
  Tags,
  aws_events as events,
} from 'aws-cdk-lib';
import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import { EventbridgeProps } from './eventbridge-types';
import { eventBusProps } from './eventbridge-fns';

export class Eventbridge extends Construct {
  public readonly eventBus?: events.EventBus;

  constructor(scope: Construct, id: string, props: EventbridgeProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    this.eventBus = new events.EventBus(this, 'EventBus', eventBusProps(props.context, props));

    // KMS encryption via CfnEventBus property override (not in CDK L1 types for this version)
    if (props.kmsKeyIdentifier) {
      const cfnBus = this.eventBus.node.defaultChild as events.CfnEventBus;
      cfnBus.addPropertyOverride('KmsKeyIdentifier', props.kmsKeyIdentifier);
    }

    // Resource-based policy
    if (props.policyDocument) {
      new events.CfnEventBusPolicy(this, 'Policy', {
        eventBusName: this.eventBus.eventBusName,
        statementId: `${contextId(props.context)}-policy`,
        statement: JSON.parse(props.policyDocument),
      });
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
