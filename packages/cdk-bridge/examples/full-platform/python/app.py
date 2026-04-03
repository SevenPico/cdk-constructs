import aws_cdk as cdk
from sevenpico.cdk_bridge import CdkBridge

app = cdk.App()
stack = cdk.Stack(app, "FullPlatformBridgeExample")

# Read the full context (namespace, environment, stage → computed ID + tags).
ctx = CdkBridge.context(stack)
print("Context ID:  ", ctx.id)

# VPC
vpc_id   = CdkBridge.string(stack, "vpcId")
vpc_cidr = CdkBridge.string(stack, "vpcCidrBlock")

# KMS
kms_key_arn     = CdkBridge.string(stack, "kmsKeyArn")
log_kms_key_arn = CdkBridge.string(stack, "logKmsKeyArn")

# DNS / Hosted Zones
public_zone_id   = CdkBridge.string(stack, "publicZoneId")
public_zone_name = CdkBridge.string(stack, "publicZoneName")

# Logs / Alarms
logs_bucket_name    = CdkBridge.string(stack, "logsBucketName")
alarms_sns_topic_arn = CdkBridge.string(stack, "alarmsSnsTopicArn")

print("VPC ID:            ", vpc_id)
print("VPC CIDR:          ", vpc_cidr)
print("KMS Key ARN:       ", kms_key_arn)
print("Log KMS Key ARN:   ", log_kms_key_arn)
print("Public Zone ID:    ", public_zone_id)
print("Public Zone Name:  ", public_zone_name)
print("Logs Bucket:       ", logs_bucket_name)
print("Alarms Topic ARN:  ", alarms_sns_topic_arn)

# Optional field with a default value.
cert_arn = CdkBridge.string(stack, "certificateArn", "arn:aws:acm:us-east-1:000000000000:certificate/none")
print("Certificate ARN:   ", cert_arn)

cdk.CfnOutput(stack, "ContextId",      value=ctx.id)
cdk.CfnOutput(stack, "VpcId",          value=vpc_id)
cdk.CfnOutput(stack, "KmsKeyArn",      value=kms_key_arn)
cdk.CfnOutput(stack, "PublicZoneName", value=public_zone_name)
cdk.CfnOutput(stack, "LogsBucketName", value=logs_bucket_name)

app.synth()
