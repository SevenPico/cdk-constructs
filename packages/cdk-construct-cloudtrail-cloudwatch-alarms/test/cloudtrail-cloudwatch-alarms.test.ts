import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { makeContext, Context } from '@sevenpico/cdk-context';
import { loadFeature, defineFeature } from 'jest-cucumber';
import path from 'path';
import { CloudtrailCloudwatchAlarms } from '../src/cloudtrail-cloudwatch-alarms';
import { CloudtrailCloudwatchAlarmsProps } from '../src/cloudtrail-cloudwatch-alarms-types';

const feature = loadFeature(path.join(__dirname, 'cloudtrail-cloudwatch-alarms.feature'));

const LOG_GROUP = '/aws/cloudtrail/7p-prod-audit';
const SNS_ARN = 'arn:aws:sns:us-east-1:123456789012:security-alerts';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

defineFeature(feature, (test: any) => {
  let context: Context;
  let stack: Stack;
  let template: Template;
  let extraProps: Partial<CloudtrailCloudwatchAlarmsProps>;

  test('All alarms created by default when no enabledAlarms filter', ({ given, when, then, and }: any) => {
    given('a default context with logGroupName and snsTopicArn', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = {};
    });
    when('a CloudtrailCloudwatchAlarms construct is created', () => {
      stack = makeStack();
      new CloudtrailCloudwatchAlarms(stack, 'SUT', {
        context, logGroupName: LOG_GROUP, snsTopicArn: SNS_ARN, ...extraProps,
      } as CloudtrailCloudwatchAlarmsProps);
      template = Template.fromStack(stack);
    });
    then(/^(\d+) AWS::CloudWatch::Alarm resources exist in the stack$/, (count: string) => {
      template.resourceCountIs('AWS::CloudWatch::Alarm', parseInt(count, 10));
    });
    and(/^(\d+) AWS::Logs::MetricFilter resources exist in the stack$/, (count: string) => {
      template.resourceCountIs('AWS::Logs::MetricFilter', parseInt(count, 10));
    });
  });

  test('Only specified alarms created when enabledAlarms provided', ({ given, when, then, and }: any) => {
    given(/^a default context with enabledAlarms "(.+)" and "(.+)"$/, (a1: string, a2: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = { enabledAlarms: [a1, a2] };
    });
    when('a CloudtrailCloudwatchAlarms construct is created', () => {
      stack = makeStack();
      new CloudtrailCloudwatchAlarms(stack, 'SUT', {
        context, logGroupName: LOG_GROUP, snsTopicArn: SNS_ARN, ...extraProps,
      } as CloudtrailCloudwatchAlarmsProps);
      template = Template.fromStack(stack);
    });
    then(/^exactly (\d+) AWS::CloudWatch::Alarm resources exist in the stack$/, (count: string) => {
      template.resourceCountIs('AWS::CloudWatch::Alarm', parseInt(count, 10));
    });
    and(/^exactly (\d+) AWS::Logs::MetricFilter resources exist in the stack$/, (count: string) => {
      template.resourceCountIs('AWS::Logs::MetricFilter', parseInt(count, 10));
    });
  });

  test('Each alarm has SNS action pointing to snsTopicArn', ({ given, when, then }: any) => {
    given(/^a default context with snsTopicArn "(.+)"$/, (arn: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = { snsTopicArn: arn };
    });
    when('a CloudtrailCloudwatchAlarms construct is created', () => {
      stack = makeStack();
      new CloudtrailCloudwatchAlarms(stack, 'SUT', {
        context, logGroupName: LOG_GROUP, snsTopicArn: extraProps.snsTopicArn!, ...extraProps,
      } as CloudtrailCloudwatchAlarmsProps);
      template = Template.fromStack(stack);
    });
    then('every AWS::CloudWatch::Alarm has an AlarmActions entry referencing the SNS ARN', () => {
      const alarms = template.findResources('AWS::CloudWatch::Alarm');
      expect(Object.keys(alarms).length).toBeGreaterThan(0);
      Object.values(alarms).forEach((alarm: any) => {
        expect(alarm.Properties.AlarmActions).toEqual(
          expect.arrayContaining([extraProps.snsTopicArn]),
        );
      });
    });
  });

  test('Alarm namespace defaults to CISBenchmark', ({ given, when, then }: any) => {
    given('a default context with no alarmNamespace prop', () => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = {};
    });
    when('a CloudtrailCloudwatchAlarms construct is created', () => {
      stack = makeStack();
      new CloudtrailCloudwatchAlarms(stack, 'SUT', {
        context, logGroupName: LOG_GROUP, snsTopicArn: SNS_ARN, ...extraProps,
      } as CloudtrailCloudwatchAlarmsProps);
      template = Template.fromStack(stack);
    });
    then(/^all metric filters have MetricNamespace "(.+)"$/, (ns: string) => {
      const filters = template.findResources('AWS::Logs::MetricFilter');
      expect(Object.keys(filters).length).toBeGreaterThan(0);
      Object.values(filters).forEach((filter: any) => {
        expect(filter.Properties.MetricTransformations[0].MetricNamespace).toBe(ns);
      });
    });
  });

  test('Root account usage alarm uses correct filter pattern', ({ given, when, then }: any) => {
    given(/^a default context with enabledAlarms "(.+)"$/, (alarmId: string) => {
      context = makeContext({ namespace: '7p', stage: 'prod', name: 'audit' });
      extraProps = { enabledAlarms: [alarmId] };
    });
    when('a CloudtrailCloudwatchAlarms construct is created', () => {
      stack = makeStack();
      new CloudtrailCloudwatchAlarms(stack, 'SUT', {
        context, logGroupName: LOG_GROUP, snsTopicArn: SNS_ARN, ...extraProps,
      } as CloudtrailCloudwatchAlarmsProps);
      template = Template.fromStack(stack);
    });
    then(/^the metric filter FilterPattern includes "(.+)"$/, (pattern: string) => {
      template.hasResourceProperties('AWS::Logs::MetricFilter', {
        FilterPattern: Match.stringLikeRegexp(pattern.replace(/\$/g, '\\$').replace(/\./g, '\\.')),
      });
    });
  });

  test('No resources created when context is disabled', ({ given, when, then, and }: any) => {
    given('a context with enabled false', () => {
      context = makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false });
      extraProps = {};
    });
    when('a CloudtrailCloudwatchAlarms construct is created', () => {
      stack = makeStack();
      new CloudtrailCloudwatchAlarms(stack, 'SUT', {
        context, logGroupName: LOG_GROUP, snsTopicArn: SNS_ARN, ...extraProps,
      } as CloudtrailCloudwatchAlarmsProps);
      template = Template.fromStack(stack);
    });
    then('no AWS::CloudWatch::Alarm resources exist in the stack', () => {
      template.resourceCountIs('AWS::CloudWatch::Alarm', 0);
    });
    and('no AWS::Logs::MetricFilter resources exist in the stack', () => {
      template.resourceCountIs('AWS::Logs::MetricFilter', 0);
    });
  });
});
