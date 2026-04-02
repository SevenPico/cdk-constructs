package com.sevenpico.example;

import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.context.Context;
import software.amazon.awscdk.App;
import software.amazon.awscdk.CfnOutput;
import software.amazon.awscdk.Stack;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "FullPlatformBridgeExample");

        // Read the full context (namespace, environment, stage → computed ID + tags).
        Context ctx = CdkBridge.context(stack);
        System.out.println("Context ID:          " + ctx.getId());

        // VPC
        String vpcId   = CdkBridge.string(stack, "vpcId");
        String vpcCidr = CdkBridge.string(stack, "vpcCidrBlock");

        // KMS
        String kmsKeyArn    = CdkBridge.string(stack, "kmsKeyArn");
        String logKmsKeyArn = CdkBridge.string(stack, "logKmsKeyArn");

        // DNS / Hosted Zones
        String publicZoneId   = CdkBridge.string(stack, "publicZoneId");
        String publicZoneName = CdkBridge.string(stack, "publicZoneName");

        // Logs / Alarms
        String logsBucketName    = CdkBridge.string(stack, "logsBucketName");
        String alarmsSnsTopicArn = CdkBridge.string(stack, "alarmsSnsTopicArn");

        System.out.println("VPC ID:              " + vpcId);
        System.out.println("VPC CIDR:            " + vpcCidr);
        System.out.println("KMS Key ARN:         " + kmsKeyArn);
        System.out.println("Log KMS Key ARN:     " + logKmsKeyArn);
        System.out.println("Public Zone ID:      " + publicZoneId);
        System.out.println("Public Zone Name:    " + publicZoneName);
        System.out.println("Logs Bucket:         " + logsBucketName);
        System.out.println("Alarms Topic ARN:    " + alarmsSnsTopicArn);

        // Optional field with a default value.
        String certArn = CdkBridge.string(stack, "certificateArn", "arn:aws:acm:us-east-1:000000000000:certificate/none");
        System.out.println("Certificate ARN:     " + certArn);

        CfnOutput.Builder.create(stack, "ContextId").value(ctx.getId()).build();
        CfnOutput.Builder.create(stack, "VpcId").value(vpcId).build();
        CfnOutput.Builder.create(stack, "KmsKeyArn").value(kmsKeyArn).build();
        CfnOutput.Builder.create(stack, "PublicZoneName").value(publicZoneName).build();
        CfnOutput.Builder.create(stack, "LogsBucketName").value(logsBucketName).build();

        app.synth();
    }
}
