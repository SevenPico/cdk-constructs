import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { S3Website } from '../src/s3-website';
import { S3WebsiteProps } from '../src/s3-website-types';

const makeStack = (): Stack => {
  const app = new App();
  return new Stack(app, 'TestStack');
};

const defaultProps = (overrides: Partial<S3WebsiteProps> = {}): S3WebsiteProps => ({
  context: makeContext({ namespace: '7p', stage: 'prod', name: 'web' }),
  acmCertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/abc-123',
  ...overrides,
});

describe('S3Website construct', () => {
  describe('disabled context', () => {
    test('creates no resources when disabled', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
      }));
      const resources = Template.fromStack(stack).toJSON().Resources ?? {};
      expect(Object.keys(resources)).toHaveLength(0);
    });
  });

  describe('origin bucket', () => {
    test('creates an S3 bucket', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).resourceCountIs('AWS::S3::Bucket', 1);
    });

    test('bucket name uses context id with -origin suffix', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).hasResourceProperties('AWS::S3::Bucket', {
        BucketName: '7p-prod-web-origin',
      });
    });

    test('blocks all public access', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });
  });

  describe('CloudFront distribution', () => {
    test('creates a distribution', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).resourceCountIs('AWS::CloudFront::Distribution', 1);
    });

    test('uses HTTPS redirect', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          DefaultCacheBehavior: Match.objectLike({
            ViewerProtocolPolicy: 'redirect-to-https',
          }),
        }),
      });
    });

    test('sets default root object to index.html', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'index.html',
        }),
      });
    });

    test('uses custom default root object when provided', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({ defaultRootObject: 'home.html' }));
      Template.fromStack(stack).hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          DefaultRootObject: 'home.html',
        }),
      });
    });

    test('includes context id as alias', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          Aliases: Match.arrayWith(['7p-prod-web']),
        }),
      });
    });

    test('includes additional aliases', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({ additionalAliases: ['www.example.com'] }));
      Template.fromStack(stack).hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          Aliases: Match.arrayWith(['7p-prod-web', 'www.example.com']),
        }),
      });
    });

    test('has default 404 error response', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).hasResourceProperties('AWS::CloudFront::Distribution', {
        DistributionConfig: Match.objectLike({
          CustomErrorResponses: Match.arrayWith([
            Match.objectLike({
              ErrorCode: 404,
              ResponseCode: 200,
              ResponsePagePath: '/index.html',
            }),
          ]),
        }),
      });
    });
  });

  describe('OAC', () => {
    test('creates an origin access control', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
    });
  });

  describe('WAF', () => {
    test('no WAF by default', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).resourceCountIs('AWS::WAFv2::WebACL', 0);
    });

    test('creates WAF when enabled', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({ wafEnabled: true }));
      Template.fromStack(stack).resourceCountIs('AWS::WAFv2::WebACL', 1);
    });

    test('WAF has CLOUDFRONT scope', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({ wafEnabled: true }));
      Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
        Scope: 'CLOUDFRONT',
      });
    });

    test('WAF has 7 managed rules', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({ wafEnabled: true }));
      Template.fromStack(stack).hasResourceProperties('AWS::WAFv2::WebACL', {
        Rules: Match.arrayWith([
          Match.objectLike({
            Statement: {
              ManagedRuleGroupStatement: Match.objectLike({
                VendorName: 'AWS',
                Name: 'AWSManagedRulesCommonRuleSet',
              }),
            },
          }),
        ]),
      });
    });
  });

  describe('DNS alias', () => {
    test('no DNS record by default', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps());
      Template.fromStack(stack).resourceCountIs('AWS::Route53::RecordSet', 0);
    });

    test('creates DNS record when enabled with zone', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({
        dnsAliasEnabled: true,
        parentZoneId: 'Z1234567890',
        parentZoneName: 'example.com',
      }));
      Template.fromStack(stack).resourceCountIs('AWS::Route53::RecordSet', 1);
    });
  });

  describe('tagging', () => {
    test('applies context tags', () => {
      const stack = makeStack();
      new S3Website(stack, 'SUT', defaultProps({
        context: makeContext({ namespace: '7p', stage: 'prod', name: 'web', tags: { Env: 'prod' } }),
      }));
      Template.fromStack(stack).hasResourceProperties('AWS::S3::Bucket', {
        Tags: Match.arrayWith([
          Match.objectLike({ Key: 'Env', Value: 'prod' }),
        ]),
      });
    });
  });

  describe('public properties', () => {
    test('exposes originBucket when enabled', () => {
      const stack = makeStack();
      const website = new S3Website(stack, 'SUT', defaultProps());
      expect(website.originBucket).toBeDefined();
    });

    test('exposes distribution when enabled', () => {
      const stack = makeStack();
      const website = new S3Website(stack, 'SUT', defaultProps());
      expect(website.distribution).toBeDefined();
    });

    test('originBucket is undefined when disabled', () => {
      const stack = makeStack();
      const website = new S3Website(stack, 'SUT', defaultProps({
        context: makeContext({ namespace: '7p', stage: 'test', name: 'test', enabled: false }),
      }));
      expect(website.originBucket).toBeUndefined();
    });

    test('dnsRecord is undefined when DNS not enabled', () => {
      const stack = makeStack();
      const website = new S3Website(stack, 'SUT', defaultProps());
      expect(website.dnsRecord).toBeUndefined();
    });
  });
});
