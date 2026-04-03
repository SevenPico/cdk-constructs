import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { S3Website } from '@sevenpico/cdk-construct-s3-website';

const app = new App();
const stack = new Stack(app, 'S3WebsiteMinimalStack');

const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app' });

// Minimal S3Website — only required props: context + ACM certificate ARN
new S3Website(stack, 'Website', {
  context,
  acmCertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
});

app.synth();
