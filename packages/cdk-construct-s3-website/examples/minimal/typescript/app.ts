import { App, Stack } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';
import { S3Website } from '@sevenpico/cdk-construct-s3-website';

const app = new App();
const stack = new Stack(app, 'S3WebsiteMinimalStack');

const context = CdkBridge.context(stack);

app.synth();
