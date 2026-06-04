import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  RemovalPolicy,
  aws_cloudwatch as cw,
  aws_cloudwatch_actions as cw_actions,
  aws_sqs as sqs,
  aws_iam as iam,
  aws_kms as kms,
  aws_logs as logs,
  aws_events as events,
  aws_events_targets as events_targets,
  aws_pipes as pipes,
  aws_sns as sns,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  dlqProps,
  rateAlarmProps,
  volumeAlarmProps,
  pipeName,
  eventbridgeRuleName,
  failedExecutionPattern,
} from './sfn-error-notification-fns';
import { SfnErrorNotificationProps } from './sfn-error-notification-types';

export class SfnErrorNotification extends Construct {
  public readonly deadLetterQueue?: sqs.Queue;
  public readonly rateAlarm?: cw.Alarm;
  public readonly volumeAlarm?: cw.Alarm;
  public readonly eventbridgeRule?: events.Rule;
  public readonly pipe?: pipes.CfnPipe;

  constructor(scope: Construct, id: string, props: SfnErrorNotificationProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // DLQ
    this.deadLetterQueue = new sqs.Queue(this, 'Dlq', {
      ...dlqProps(props.context, props),
      encryptionMasterKey: props.sqsKmsKeyArn
        ? kms.Key.fromKeyArn(this, 'DlqKey', props.sqsKmsKeyArn)
        : undefined,
    });

    // CloudWatch alarms
    this.rateAlarm = new cw.Alarm(this, 'RateAlarm',
      rateAlarmProps(props.context, props, this.deadLetterQueue),
    );
    this.rateAlarm.addAlarmAction(new cw_actions.SnsAction(
      sns.Topic.fromTopicArn(this, 'RateTopic', props.rateAlarmSnsTopicArn),
    ));

    this.volumeAlarm = new cw.Alarm(this, 'VolumeAlarm',
      volumeAlarmProps(props.context, props, this.deadLetterQueue),
    );
    this.volumeAlarm.addAlarmAction(new cw_actions.SnsAction(
      sns.Topic.fromTopicArn(this, 'VolumeTopic', props.volumeAlarmSnsTopicArn),
    ));

    // EventBridge rule: capture failed executions -> route to DLQ
    this.eventbridgeRule = new events.Rule(this, 'FailedRule', {
      ruleName: eventbridgeRuleName(props.context, props),
      eventPattern: failedExecutionPattern(props.stateMachineArn),
    });
    this.eventbridgeRule.addTarget(new events_targets.SqsQueue(this.deadLetterQueue));

    // EventBridge Pipe: DLQ -> Step Functions (reprocessing)
    const pipeRole = new iam.Role(this, 'PipeRole', {
      assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com'),
    });
    this.deadLetterQueue.grantConsumeMessages(pipeRole);
    pipeRole.addToPolicy(new iam.PolicyStatement({
      actions: ['states:StartExecution'],
      resources: [props.stateMachineArn],
    }));

    const pName = pipeName(props.context, props);
    const pipeLogGroup = new logs.LogGroup(this, 'PipeLogGroup', {
      logGroupName: `/aws/pipes/${pName}`,
      retention: (props.cloudwatchLogRetentionDays ?? 90) as logs.RetentionDays,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.pipe = new pipes.CfnPipe(this, 'Pipe', {
      name: pName,
      roleArn: pipeRole.roleArn,
      source: this.deadLetterQueue.queueArn,
      target: props.stateMachineArn,
      sourceParameters: {
        sqsQueueParameters: { batchSize: props.eventbridgePipeBatchSize ?? 1 },
      },
      targetParameters: {
        stepFunctionStateMachineParameters: {
          invocationType: 'FIRE_AND_FORGET',
        },
        inputTemplate: props.targetStepFunctionInputTemplate ?? '<$.detail.input>',
      },
    });
    this.pipe.addPropertyOverride('LogConfiguration', {
      CloudwatchLogsLogDestination: { LogGroupArn: pipeLogGroup.logGroupArn },
      Level: props.eventbridgePipeLogLevel ?? 'ERROR',
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
