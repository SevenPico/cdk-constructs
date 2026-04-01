import { Construct } from 'constructs';
import { Tags, aws_sns as sns, aws_sns_subscriptions as subs, aws_sqs as sqs, aws_kms as kms, aws_iam as iam, aws_lambda as lambda } from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { SnsProps, SnsSubscriber } from './sns-types';
import { snsTopicProps, dlqProps } from './sns-fns';

export class Sns extends Construct {
  public readonly topic?: sns.Topic;
  public readonly deadLetterQueue?: sqs.Queue;

  constructor(scope: Construct, id: string, props: SnsProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    // Encryption key
    let masterKey: kms.IKey | undefined;
    if (props.encryptionEnabled && props.kmsMasterKeyId) {
      masterKey = kms.Key.fromKeyArn(this, 'Key', props.kmsMasterKeyId);
    }

    // Topic
    this.topic = new sns.Topic(this, 'Topic', {
      ...snsTopicProps(props.context, props),
      masterKey,
    });

    // Access policy
    if (props.snsTopicPolicyJson) {
      const parsed = JSON.parse(props.snsTopicPolicyJson);
      const stmts: unknown[] = parsed.Statement ?? [];
      stmts.forEach(stmt => {
        this.topic!.addToResourcePolicy(iam.PolicyStatement.fromJson(stmt));
      });
    } else {
      (props.allowedAwsServicesForPublish ?? []).forEach(svc =>
        this.topic!.grantPublish(new iam.ServicePrincipal(svc)),
      );
      (props.allowedIamArnsForPublish ?? []).forEach(arn =>
        this.topic!.grantPublish(new iam.ArnPrincipal(arn)),
      );
    }

    // Subscriptions
    let subIndex = 0;
    Object.entries(props.subscribers ?? {}).forEach(([_name, subscriber]) => {
      this.addSubscription(subscriber, subIndex);
      subIndex++;
    });

    // DLQ for failed deliveries
    if (props.sqsDlqEnabled) {
      const dlqEncKey = props.sqsQueueKmsMasterKeyId
        ? kms.Key.fromKeyArn(this, 'DlqKey', props.sqsQueueKmsMasterKeyId)
        : undefined;
      this.deadLetterQueue = new sqs.Queue(this, 'Dlq', {
        ...dlqProps(props.context, props),
        encryptionMasterKey: dlqEncKey,
      });
    }

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }

  private addSubscription(subscriber: SnsSubscriber, index: number): void {
    if (!this.topic) return;
    switch (subscriber.protocol) {
      case 'sqs':
        this.topic.addSubscription(new subs.SqsSubscription(
          sqs.Queue.fromQueueArn(this, `SubQueue${index}`, subscriber.endpoint),
          { rawMessageDelivery: subscriber.rawMessageDelivery ?? false },
        ));
        break;
      case 'lambda':
        this.topic.addSubscription(new subs.LambdaSubscription(
          lambda.Function.fromFunctionArn(this, `SubLambda${index}`, subscriber.endpoint),
        ));
        break;
      case 'https':
      case 'http':
        this.topic.addSubscription(new subs.UrlSubscription(subscriber.endpoint, {
          rawMessageDelivery: subscriber.rawMessageDelivery ?? false,
        }));
        break;
      case 'email':
        this.topic.addSubscription(new subs.EmailSubscription(subscriber.endpoint));
        break;
      case 'sms':
        this.topic.addSubscription(new subs.SmsSubscription(subscriber.endpoint));
        break;
      default:
        throw new Error(`Unsupported SNS protocol: ${subscriber.protocol}`);
    }
  }
}
