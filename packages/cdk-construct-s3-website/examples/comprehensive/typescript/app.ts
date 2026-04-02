import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { S3Website } from '@sevenpico/cdk-construct-s3-website';

const app = new App();
const stack = new Stack(app, 'S3WebsiteComprehensiveStack');

const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

// Comprehensive S3Website — WAF, CloudFront logging, custom error responses,
// CORS, geo restriction, DNS alias, deployment principals, additional aliases
new S3Website(stack, 'Website', {
  context,
  acmCertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
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

app.synth();
