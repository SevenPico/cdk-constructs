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
  aws_pipes as pipes,
  aws_sns as sns,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  dlqProps,
  rateAlarmProps,
  volumeAlarmProps,
  pipeName,
} from './lambda-error-notification-fns';
import { LambdaErrorNotificationProps } from './lambda-error-notification-types';

export class LambdaErrorNotification extends Construct {
  public readonly deadLetterQueue?: sqs.Queue;
  public readonly rateAlarm?: cw.Alarm;
  public readonly volumeAlarm?: cw.Alarm;
  public readonly pipe?: pipes.CfnPipe;

  constructor(scope: Construct, id: string, props: LambdaErrorNotificationProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // SQS Dead Letter Queue
    this.deadLetterQueue = new sqs.Queue(this, 'Dlq', {
      ...dlqProps(props.context, props),
      encryptionMasterKey: props.sqsKmsConfig
        ? kms.Key.fromKeyArn(this, 'DlqKey', props.sqsKmsConfig.keyArn)
        : undefined,
    });

    // Attach SQS send policy to the Lambda execution role
    const lambdaRole = iam.Role.fromRoleName(this, 'LambdaRole', props.lambdaRoleName);
    this.deadLetterQueue.grantSendMessages(lambdaRole);

    // Allow EventBridge service to send to DLQ
    this.deadLetterQueue.addToResourcePolicy(new iam.PolicyStatement({
      principals: [new iam.ServicePrincipal('events.amazonaws.com')],
      actions: ['sqs:SendMessage'],
      resources: [this.deadLetterQueue.queueArn],
    }));

    // CloudWatch alarms
    this.rateAlarm = new cw.Alarm(this, 'RateAlarm',
      rateAlarmProps(props.context, props, this.deadLetterQueue),
    );
    this.rateAlarm.addAlarmAction(new cw_actions.SnsAction(
      sns.Topic.fromTopicArn(this, 'RateSnsTopic', props.rateAlarmSnsTopicArn),
    ));

    this.volumeAlarm = new cw.Alarm(this, 'VolumeAlarm',
      volumeAlarmProps(props.context, props, this.deadLetterQueue),
    );
    this.volumeAlarm.addAlarmAction(new cw_actions.SnsAction(
      sns.Topic.fromTopicArn(this, 'VolumeSnsTopic', props.volumeAlarmSnsTopicArn),
    ));

    // EventBridge Pipe: DLQ -> Lambda (for reprocessing)
    const pipeRole = new iam.Role(this, 'PipeRole', {
      assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com'),
    });
    this.deadLetterQueue.grantConsumeMessages(pipeRole);
    pipeRole.addToPolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [props.lambdaArn],
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
      target: props.lambdaArn,
      sourceParameters: {
        sqsQueueParameters: { batchSize: props.eventbridgePipeBatchSize ?? 1 },
      },
      targetParameters: {
        inputTemplate: props.targetLambdaInputTemplate ?? '<$.requestPayload>',
      },
    });
    this.pipe.addPropertyOverride('LogConfiguration', {
      CloudwatchLogsLogDestination: { LogGroupArn: pipeLogGroup.logGroupArn },
      Level: props.eventbridgePipeLogLevel ?? 'ERROR',
    });

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}
