import { Construct } from 'constructs';
import {
  Tags,
  Duration,
  RemovalPolicy,
  aws_sns as sns,
  aws_sns_subscriptions as subs,
  aws_lambda as lambda,
  aws_iam as iam,
  aws_logs as logs,
} from 'aws-cdk-lib';
import { contextTags, isEnabled } from '@sevenpico/cdk-context';
import { SlackbotProps } from './slackbot-types';
import {
  topicName,
  lambdaFunctionName,
  lambdaRoleName,
  logGroupName,
  lambdaEnvironment,
  secretsManagerPolicyStatements,
} from './slackbot-fns';

export class Slackbot extends Construct {
  public readonly snsTopic?: sns.Topic;
  public readonly lambdaFn?: lambda.Function;

  constructor(scope: Construct, id: string, props: SlackbotProps) {
    super(scope, id);
    if (!isEnabled(props.context)) return;

    this.snsTopic = new sns.Topic(this, 'Topic', {
      topicName: topicName(props.context),
    });

    Object.entries(props.snsPubPrincipals ?? {}).forEach(([type, ids]) =>
      ids.forEach(principalId =>
        this.snsTopic!.grantPublish(buildPrincipal(type, principalId)),
      ),
    );

    const role = new iam.Role(this, 'LambdaRole', {
      roleName: lambdaRoleName(props.context),
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });
    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
    );
    secretsManagerPolicyStatements(props.slackTokenSecretArn, props.slackTokenSecretKmsKeyArn)
      .forEach(s => role.addToPolicy(s));

    const lg = new logs.LogGroup(this, 'LogGroup', {
      logGroupName: logGroupName(props.context),
      retention: (props.cloudwatchLogExpirationDays ?? 90) as logs.RetentionDays,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.lambdaFn = new lambda.Function(this, 'Handler', {
      functionName: lambdaFunctionName(props.context),
      handler: 'main.lambda_handler',
      runtime: new lambda.Runtime(props.lambdaRuntime ?? 'python3.9'),
      code: lambda.Code.fromAsset(props.lambdaCodePath ?? './lambda'),
      timeout: Duration.seconds(30),
      environment: lambdaEnvironment(props),
      role,
      logGroup: lg,
    });

    this.snsTopic.addSubscription(new subs.LambdaSubscription(this.lambdaFn));

    Object.entries(contextTags(props.context)).forEach(([k, v]) => Tags.of(this).add(k, v));
  }
}

const buildPrincipal = (type: string, id: string): iam.IPrincipal => {
  switch (type) {
    case 'Service': return new iam.ServicePrincipal(id);
    case 'AWS': return new iam.ArnPrincipal(id);
    default: return new iam.ArnPrincipal(id);
  }
};
