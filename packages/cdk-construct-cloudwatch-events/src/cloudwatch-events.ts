import { Construct } from 'constructs';
import { Tags } from 'aws-cdk-lib';
import { aws_events as events } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { CloudwatchEventsProps } from './cloudwatch-events-types';
import { ruleProps, buildTarget } from './cloudwatch-events-fns';

export class CloudwatchEvents extends Construct {
  public readonly rules?: events.Rule[];

  constructor(scope: Construct, id: string, props: CloudwatchEventsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    this.rules = props.rules.map((ruleCfg) => {
      const rule = new events.Rule(
        this,
        `Rule-${ruleCfg.name}`,
        ruleProps(props.context, ruleCfg),
      );

      ruleCfg.targets.forEach((targetCfg, index) => {
        const targetId = `${ruleCfg.name}-${index}`;
        rule.addTarget(buildTarget(this, targetId, targetCfg));
      });

      return rule;
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) =>
      Tags.of(this).add(k, v),
    );
  }
}
