import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { Ses } from '../src/ses';
import { SesProps } from '../src/ses-types';

const context = makeContext({ namespace: 'mail', stage: 'prod', name: 'example-com' });

const baseProps: SesProps = {
  context,
};

const synthTemplate = (props: SesProps): Template => {
  const app = new App();
  const stack = new Stack(app, 'TestStack');
  new Ses(stack, 'SUT', props);
  return Template.fromStack(stack);
};

describe('Ses construct', () => {
  describe('SES Identity', () => {
    test('domain identity created with context ID', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::SES::EmailIdentity', {
        EmailIdentity: 'mail-prod-example-com',
      });
    });
  });

  describe('DNS Verification', () => {
    test('TXT verification record created when verifyDomain is true', () => {
      const template = synthTemplate({
        ...baseProps,
        verifyDomain: true,
        zoneId: 'Z1234567890',
        zoneName: 'example.com',
      });
      template.hasResourceProperties('AWS::Route53::RecordSet', {
        Type: 'TXT',
      });
    });

    test('no Route53 records when verifyDomain is false', () => {
      const template = synthTemplate(baseProps);
      expect(template.findResources('AWS::Route53::RecordSet')).toEqual({});
    });

    test('DKIM CNAME records created when verifyDkim is true', () => {
      const template = synthTemplate({
        ...baseProps,
        verifyDkim: true,
        zoneId: 'Z1234567890',
        zoneName: 'example.com',
      });
      const cnameRecords = template.findResources('AWS::Route53::RecordSet', {
        Properties: { Type: 'CNAME' },
      });
      expect(Object.keys(cnameRecords).length).toBe(3);
    });

    test('both verifyDomain and verifyDkim create TXT and CNAME records', () => {
      const template = synthTemplate({
        ...baseProps,
        verifyDomain: true,
        verifyDkim: true,
        zoneId: 'Z1234567890',
        zoneName: 'example.com',
      });
      const txtRecords = template.findResources('AWS::Route53::RecordSet', {
        Properties: { Type: 'TXT' },
      });
      const cnameRecords = template.findResources('AWS::Route53::RecordSet', {
        Properties: { Type: 'CNAME' },
      });
      expect(Object.keys(txtRecords).length).toBe(1);
      expect(Object.keys(cnameRecords).length).toBe(3);
    });

    test('DKIM-only (without verifyDomain) creates CNAME records', () => {
      const template = synthTemplate({
        ...baseProps,
        verifyDkim: true,
        verifyDomain: false,
        zoneId: 'Z1234567890',
        zoneName: 'example.com',
      });
      const cnameRecords = template.findResources('AWS::Route53::RecordSet', {
        Properties: { Type: 'CNAME' },
      });
      expect(Object.keys(cnameRecords).length).toBe(3);
      // No TXT record
      const txtRecords = template.findResources('AWS::Route53::RecordSet', {
        Properties: { Type: 'TXT' },
      });
      expect(Object.keys(txtRecords).length).toBe(0);
    });
  });

  describe('IAM Group', () => {
    test('IAM group created by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::IAM::Group', {
        GroupName: 'mail-prod-example-com-ses',
      });
    });

    test('group policy includes ses:SendRawEmail', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 'ses:SendRawEmail',
            }),
          ]),
        }),
      });
    });

    test('no IAM group when sesGroupEnabled is false', () => {
      const template = synthTemplate({ ...baseProps, sesGroupEnabled: false });
      expect(template.findResources('AWS::IAM::Group')).toEqual({});
    });

    test('custom group name used when provided', () => {
      const template = synthTemplate({ ...baseProps, sesGroupName: 'custom-group' });
      template.hasResourceProperties('AWS::IAM::Group', {
        GroupName: 'custom-group',
      });
    });
  });

  describe('IAM User', () => {
    test('IAM user created by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResourceProperties('AWS::IAM::User', {
        UserName: 'mail-prod-example-com-ses-user',
      });
    });

    test('no IAM user when sesUserEnabled is false', () => {
      const template = synthTemplate({ ...baseProps, sesUserEnabled: false });
      expect(template.findResources('AWS::IAM::User')).toEqual({});
    });

    test('access key created by default', () => {
      const template = synthTemplate(baseProps);
      template.hasResource('AWS::IAM::AccessKey', {});
    });

    test('no access key when createIamAccessKey is false', () => {
      const template = synthTemplate({ ...baseProps, createIamAccessKey: false });
      expect(template.findResources('AWS::IAM::AccessKey')).toEqual({});
    });

    test('user and group both created when both enabled', () => {
      const template = synthTemplate(baseProps);
      template.hasResource('AWS::IAM::User', {});
      template.hasResource('AWS::IAM::Group', {});
    });

    test('managed policies attached when provided', () => {
      const template = synthTemplate({
        ...baseProps,
        policyArns: ['arn:aws:iam::aws:policy/AmazonSESFullAccess'],
      });
      template.hasResourceProperties('AWS::IAM::User', {
        ManagedPolicyArns: Match.arrayWith([
          'arn:aws:iam::aws:policy/AmazonSESFullAccess',
        ]),
      });
    });

    test('inline policies attached when provided', () => {
      const policyJson = JSON.stringify({
        Version: '2012-10-17',
        Statement: [{
          Effect: 'Allow',
          Action: 's3:GetObject',
          Resource: 'arn:aws:s3:::my-bucket/*',
        }],
      });
      const template = synthTemplate({
        ...baseProps,
        inlinePolicies: [policyJson],
      });
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: Match.objectLike({
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: 's3:GetObject',
              Resource: 'arn:aws:s3:::my-bucket/*',
            }),
          ]),
        }),
      });
    });

    test('permissions boundary applied when provided', () => {
      const template = synthTemplate({
        ...baseProps,
        permissionsBoundary: 'arn:aws:iam::123456789012:policy/Boundary',
      });
      template.hasResourceProperties('AWS::IAM::User', {
        PermissionsBoundary: 'arn:aws:iam::123456789012:policy/Boundary',
      });
    });
  });

  describe('Disabled Construct', () => {
    test('no resources created when context is disabled', () => {
      const disabledCtx = makeContext({
        namespace: 'mail', stage: 'prod', name: 'example-com', enabled: false,
      });
      const template = synthTemplate({ ...baseProps, context: disabledCtx });
      expect(Object.keys(template.toJSON().Resources ?? {})).toHaveLength(0);
    });
  });
});
