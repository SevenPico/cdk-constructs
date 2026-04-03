import { App, Stack } from 'aws-cdk-lib';
import { makeContext } from '@sevenpico/cdk-context';
import { S3Website } from '@sevenpico/cdk-construct-s3-website';

const app = new App();
const stack = new Stack(app, 'S3WebsiteDisabledStack');

// enabled: false — construct creates no resources
const context = makeContext({ namespace: 'acme', environment: 'dev', stage: 'app', enabled: false });

new S3Website(stack, 'Website', {
  context,
  acmCertificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
});

app.synth();
