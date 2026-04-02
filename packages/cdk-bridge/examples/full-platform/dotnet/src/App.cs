using Amazon.CDK;
using SevenPico.CdkBridge;

var app = new App();
var stack = new Stack(app, "FullPlatformBridgeExample");

// Read the full context (namespace, environment, stage → computed ID + tags).
var ctx = CdkBridge.Context(stack);
Console.WriteLine($"Context ID:          {ctx.Id}");

// VPC
var vpcId   = CdkBridge.String(stack, "vpcId");
var vpcCidr = CdkBridge.String(stack, "vpcCidrBlock");

// KMS
var kmsKeyArn    = CdkBridge.String(stack, "kmsKeyArn");
var logKmsKeyArn = CdkBridge.String(stack, "logKmsKeyArn");

// DNS / Hosted Zones
var publicZoneId   = CdkBridge.String(stack, "publicZoneId");
var publicZoneName = CdkBridge.String(stack, "publicZoneName");

// Logs / Alarms
var logsBucketName    = CdkBridge.String(stack, "logsBucketName");
var alarmsSnsTopicArn = CdkBridge.String(stack, "alarmsSnsTopicArn");

Console.WriteLine($"VPC ID:              {vpcId}");
Console.WriteLine($"VPC CIDR:            {vpcCidr}");
Console.WriteLine($"KMS Key ARN:         {kmsKeyArn}");
Console.WriteLine($"Log KMS Key ARN:     {logKmsKeyArn}");
Console.WriteLine($"Public Zone ID:      {publicZoneId}");
Console.WriteLine($"Public Zone Name:    {publicZoneName}");
Console.WriteLine($"Logs Bucket:         {logsBucketName}");
Console.WriteLine($"Alarms Topic ARN:    {alarmsSnsTopicArn}");

// Optional field with a default value.
var certArn = CdkBridge.String(stack, "certificateArn", "arn:aws:acm:us-east-1:000000000000:certificate/none");
Console.WriteLine($"Certificate ARN:     {certArn}");

new CfnOutput(stack, "ContextId",      new CfnOutputProps { Value = ctx.Id });
new CfnOutput(stack, "VpcId",          new CfnOutputProps { Value = vpcId });
new CfnOutput(stack, "KmsKeyArn",      new CfnOutputProps { Value = kmsKeyArn });
new CfnOutput(stack, "PublicZoneName", new CfnOutputProps { Value = publicZoneName });
new CfnOutput(stack, "LogsBucketName", new CfnOutputProps { Value = logsBucketName });

app.Synth();
