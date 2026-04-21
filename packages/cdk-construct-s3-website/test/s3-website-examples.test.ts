import { makeContext } from '@sevenpico/cdk-context';
import { App, Stack } from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { S3Website } from '../src/s3-website';

// Shared context matching examples/*/cdk.json
const CONTEXT = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });
const ACM_CERT_ARN = 'arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function makeStack(): Stack {
  const app = new App();
  return new Stack(app, 'TestStack');
}

// ---------------------------------------------------------------------------
// Example scenario: minimal
// ---------------------------------------------------------------------------

describe('Example: minimal', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3Website(stack, 'Website', {
      context: CONTEXT,
      acmCertificateArn: ACM_CERT_ARN,
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('creates exactly 1 CloudFront distribution', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });

  test('creates an OAC for S3 access', () => {
    template.resourceCountIs('AWS::CloudFront::OriginAccessControl', 1);
  });

  test('distribution uses HTTPS redirect', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultCacheBehavior: Match.objectLike({
          ViewerProtocolPolicy: 'redirect-to-https',
        }),
      }),
    });
  });

  test('distribution has default root object index.html', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: 'index.html',
      }),
    });
  });

  test('origin bucket blocks all public access', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('no WAF web ACL created', () => {
    template.resourceCountIs('AWS::WAFv2::WebACL', 0);
  });

  test('no Route53 record created', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 0);
  });
});

// ---------------------------------------------------------------------------
// Example scenario: comprehensive
// ---------------------------------------------------------------------------

describe('Example: comprehensive', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3Website(stack, 'Website', {
      context: CONTEXT,
      acmCertificateArn: ACM_CERT_ARN,
      additionalAliases: ['www.acme-dev-app.example.com'],
      defaultRootObject: 'index.html',
      wafEnabled: true,
      cloudfrontAccessLoggingEnabled: true,
      cloudfrontAccessLogBucketId: 'acme-dev-app-cf-logs',
      cloudfrontAccessLogPrefix: 'cf/',
      corsAllowedOrigins: ['https://acme-dev-app.example.com'],
      customErrorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: 10 },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html', ttl: 10 },
      ],
      geoRestriction: {
        restrictionType: 'whitelist',
        locations: ['US', 'CA', 'GB'],
      },
      dnsAliasEnabled: true,
      parentZoneId: 'Z1234567890ABCDEF',
      parentZoneName: 'example.com',
      deploymentPrincipalArns: [
        'arn:aws:iam::123456789012:role/acme-deploy-role',
      ],
      tlsProtocolVersion: 'TLSv1.2_2021',
    });
    template = Template.fromStack(stack);
  });

  test('creates exactly 1 S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('creates exactly 1 CloudFront distribution', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });

  test('WAF web ACL is created', () => {
    template.resourceCountIs('AWS::WAFv2::WebACL', 1);
  });

  test('WAF scope is CLOUDFRONT', () => {
    template.hasResourceProperties('AWS::WAFv2::WebACL', {
      Scope: 'CLOUDFRONT',
    });
  });

  test('distribution has geo restriction whitelist', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Restrictions: Match.objectLike({
          GeoRestriction: Match.objectLike({
            RestrictionType: 'whitelist',
            Locations: Match.arrayWith(['US', 'CA', 'GB']),
          }),
        }),
      }),
    });
  });

  test('distribution has custom error responses for 403 and 404', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({ ErrorCode: 403, ResponseCode: 200 }),
          Match.objectLike({ ErrorCode: 404, ResponseCode: 200 }),
        ]),
      }),
    });
  });

  test('Route53 A record is created for DNS alias', () => {
    template.resourceCountIs('AWS::Route53::RecordSet', 1);
  });

  test('CORS configured on origin bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      CorsConfiguration: Match.objectLike({
        CorsRules: Match.arrayWith([
          Match.objectLike({
            AllowedOrigins: ['https://acme-dev-app.example.com'],
          }),
        ]),
      }),
    });
  });
});

// ---------------------------------------------------------------------------
// Example scenario: disabled
// ---------------------------------------------------------------------------

describe('Example: disabled', () => {
  let template: Template;

  beforeAll(() => {
    const stack = makeStack();
    new S3Website(stack, 'Website', {
      context: makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false }),
      acmCertificateArn: ACM_CERT_ARN,
    });
    template = Template.fromStack(stack);
  });

  test('creates no resources when disabled', () => {
    const resources = template.toJSON().Resources ?? {};
    expect(Object.keys(resources)).toHaveLength(0);
  });

  test('creates no S3 buckets', () => {
    template.resourceCountIs('AWS::S3::Bucket', 0);
  });

  test('creates no CloudFront distributions', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 0);
  });
});
