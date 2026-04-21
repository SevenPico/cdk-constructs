import { contextId, contextTags, isEnabled } from '@sevenpico/cdk-context';
import {
  Tags,
  RemovalPolicy,
  aws_cloudwatch as cw,
  aws_cloudwatch_actions as cw_actions,
  aws_sqs as sqs,
  aws_iam as iam,
  aws_kms as kms,
  aws_logs as logs,
  aws_pipes as pipes,
  aws_sns as sns,
  Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  machineDlqContext,
  machinePipeName,
  expressRateAlarmProps,
  expressVolumeAlarmProps,
} from './express-sfn-error-notification-fns';
import { ExpressSfnErrorNotificationProps } from './express-sfn-error-notification-types';

export class ExpressSfnErrorNotification extends Construct {
  public readonly deadLetterQueues: Record<string, sqs.Queue> = {};
  public readonly rateAlarms: Record<string, cw.Alarm> = {};
  public readonly volumeAlarms: Record<string, cw.Alarm> = {};
  public readonly pipes: Record<string, pipes.CfnPipe> = {};

  constructor(scope: Construct, id: string, props: ExpressSfnErrorNotificationProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    const rateTopic = sns.Topic.fromTopicArn(this, 'RateTopic', props.rateAlarmSnsTopicArn);
    const volumeTopic = sns.Topic.fromTopicArn(this, 'VolumeTopic', props.volumeAlarmSnsTopicArn);

    Object.entries(props.stepFunctions).forEach(([key, target]) => {
      const dCtx = machineDlqContext(props.context, key);

      // DLQ
      const dlq = new sqs.Queue(this, `Dlq-${key}`, {
        queueName: target.sqsQueueName ?? contextId(dCtx),
        retentionPeriod: Duration.seconds(props.sqsMessageRetentionSeconds ?? 604800),
        visibilityTimeout: Duration.seconds(props.sqsVisibilityTimeoutSeconds ?? 30),
        encryptionMasterKey: props.sqsKmsConfig
          ? kms.Key.fromKeyArn(this, `DlqKey-${key}`, props.sqsKmsConfig.keyArn)
          : undefined,
      });
      this.deadLetterQueues[key] = dlq;

      // Alarms
      const rateAlarm = new cw.Alarm(this, `RateAlarm-${key}`,
        expressRateAlarmProps(props.context, props, key, target, dlq),
      );
      rateAlarm.addAlarmAction(new cw_actions.SnsAction(rateTopic));
      this.rateAlarms[key] = rateAlarm;

      const volumeAlarm = new cw.Alarm(this, `VolumeAlarm-${key}`,
        expressVolumeAlarmProps(props.context, props, key, target, dlq),
      );
      volumeAlarm.addAlarmAction(new cw_actions.SnsAction(volumeTopic));
      this.volumeAlarms[key] = volumeAlarm;

      // Pipe
      const pipeRole = new iam.Role(this, `PipeRole-${key}`, {
        assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com'),
      });
      dlq.grantConsumeMessages(pipeRole);
      pipeRole.addToPolicy(new iam.PolicyStatement({
        actions: ['states:StartExecution'],
        resources: [target.arn],
      }));

      const pName = machinePipeName(props.context, key);
      const pipeLogGroup = new logs.LogGroup(this, `PipeLogGroup-${key}`, {
        logGroupName: `/aws/pipes/${pName}`,
        retention: (props.cloudwatchLogRetentionDays ?? 90) as logs.RetentionDays,
        removalPolicy: RemovalPolicy.DESTROY,
      });

      const pipe = new pipes.CfnPipe(this, `Pipe-${key}`, {
        name: pName,
        roleArn: pipeRole.roleArn,
        source: dlq.queueArn,
        target: target.arn,
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
      pipe.addPropertyOverride('LogConfiguration', {
        CloudwatchLogsLogDestination: { LogGroupArn: pipeLogGroup.logGroupArn },
        Level: props.eventbridgePipeLogLevel ?? 'ERROR',
      });
      this.pipes[key] = pipe;
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
