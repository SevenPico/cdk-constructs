import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  aws_cloudwatch as cloudwatch,
  aws_cloudwatch_actions as cw_actions,
  aws_logs as logs,
  aws_sns as sns,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  alarmDefinitions,
  alarmProps,
  AlarmDefinition,
} from './cloudtrail-cloudwatch-alarms-fns';
import { CloudtrailCloudwatchAlarmsProps } from './cloudtrail-cloudwatch-alarms-types';

export class CloudtrailCloudwatchAlarms extends Construct {
  public readonly alarms?: cloudwatch.Alarm[];

  constructor(scope: Construct, id: string, props: CloudtrailCloudwatchAlarmsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const namespace = props.alarmNamespace ?? 'CISBenchmark';
    const periodSeconds = props.alarmPeriodSeconds ?? 300;
    const evalPeriods = props.alarmEvaluationPeriods ?? 1;
    const threshold = props.alarmThreshold ?? 1;
    const logGroup = logs.LogGroup.fromLogGroupName(this, 'LogGroup', props.logGroupName);
    const snsTopic = sns.Topic.fromTopicArn(this, 'AlarmTopic', props.snsTopicArn);
    const enabledSet = props.enabledAlarms ? new Set(props.enabledAlarms) : null;

    const defs: AlarmDefinition[] = alarmDefinitions().filter(
      (def) => enabledSet === null || enabledSet.has(def.id),
    );

    this.alarms = defs.map((def) => {
      new logs.MetricFilter(this, `Filter-${def.id}`, {
        logGroup,
        filterPattern: logs.FilterPattern.literal(def.filterPattern),
        metricNamespace: namespace,
        metricName: def.metricName,
        metricValue: '1',
        defaultValue: 0,
      });

      const alarm = new cloudwatch.Alarm(
        this,
        `Alarm-${def.id}`,
        alarmProps(props.context, def, namespace, periodSeconds, evalPeriods, threshold),
      );

      alarm.addAlarmAction(new cw_actions.SnsAction(snsTopic));

      return alarm;
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) =>
      Tags.of(this).add(k, v),
    );
  }
}
