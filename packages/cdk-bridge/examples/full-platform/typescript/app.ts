import { App, Stack, CfnOutput } from 'aws-cdk-lib';
import { CdkBridge } from '@sevenpico/cdk-bridge';

const app = new App();
const stack = new Stack(app, 'FullPlatformBridgeExample');

// Read the full context (namespace, environment, stage → computed ID + tags).
const ctx = CdkBridge.context(stack);
console.log('Context ID:  ', ctx.id);

// VPC
const vpcId        = CdkBridge.string(stack, 'vpcId');
const vpcCidr      = CdkBridge.string(stack, 'vpcCidrBlock');

// KMS
const kmsKeyArn    = CdkBridge.string(stack, 'kmsKeyArn');
const logKmsKeyArn = CdkBridge.string(stack, 'logKmsKeyArn');

// DNS / Hosted Zones
const publicZoneId   = CdkBridge.string(stack, 'publicZoneId');
const publicZoneName = CdkBridge.string(stack, 'publicZoneName');

// Logs / Alarms
const logsBucketName   = CdkBridge.string(stack, 'logsBucketName');
const alarmsSnsTopicArn = CdkBridge.string(stack, 'alarmsSnsTopicArn');

console.log('VPC ID:            ', vpcId);
console.log('VPC CIDR:          ', vpcCidr);
console.log('KMS Key ARN:       ', kmsKeyArn);
console.log('Log KMS Key ARN:   ', logKmsKeyArn);
console.log('Public Zone ID:    ', publicZoneId);
console.log('Public Zone Name:  ', publicZoneName);
console.log('Logs Bucket:       ', logsBucketName);
console.log('Alarms Topic ARN:  ', alarmsSnsTopicArn);

// Optional field with a default value — certificateArn may not exist in all envs.
const certArn = CdkBridge.string(stack, 'certificateArn', 'arn:aws:acm:us-east-1:000000000000:certificate/none');
console.log('Certificate ARN:   ', certArn);

new CfnOutput(stack, 'ContextId',        { value: ctx.id });
new CfnOutput(stack, 'VpcId',            { value: vpcId });
new CfnOutput(stack, 'KmsKeyArn',        { value: kmsKeyArn });
new CfnOutput(stack, 'PublicZoneName',   { value: publicZoneName });
new CfnOutput(stack, 'LogsBucketName',   { value: logsBucketName });

app.synth();
