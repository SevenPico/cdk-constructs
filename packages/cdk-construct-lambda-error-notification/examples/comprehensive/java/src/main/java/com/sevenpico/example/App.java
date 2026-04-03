package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.lambda.error.notification.LambdaErrorNotification;
import com.sevenpico.cdk.construct.lambda.error.notification.LambdaErrorNotificationProps;
import com.sevenpico.cdk.construct.lambda.error.notification.SqsKmsConfig;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "LambdaErrorNotificationComprehensiveStack");

        // Load context and platform references from CDK Bridge JSON.
        var context = CdkBridge.context(stack);
        var lambdaArn = CdkBridge.string(stack, "lambdaArn");
        var lambdaFunctionName = CdkBridge.string(stack, "lambdaFunctionName");
        var lambdaRoleName = CdkBridge.string(stack, "lambdaRoleName");
        var alarmsSnsTopicArn = CdkBridge.string(stack, "alarmsSnsTopicArn");
        var kmsKeyArn = CdkBridge.string(stack, "kmsKeyArn");
        var kmsKeyId = CdkBridge.string(stack, "kmsKeyId");

        new LambdaErrorNotification(stack, "LambdaMonitor",
            LambdaErrorNotificationProps.builder()
                .context(context)
                .lambdaArn(lambdaArn)
                .lambdaFunctionName(lambdaFunctionName)
                .lambdaRoleName(lambdaRoleName)
                .rateAlarmSnsTopicArn(alarmsSnsTopicArn)
                .volumeAlarmSnsTopicArn(alarmsSnsTopicArn)
                // KMS-encrypted DLQ
                .sqsKmsConfig(SqsKmsConfig.builder().keyId(kmsKeyId).keyArn(kmsKeyArn).build())
                .sqsQueueName("acme-dev-app-processor-dlq")
                .sqsMessageRetentionSeconds(1209600)
                .sqsVisibilityTimeoutSeconds(30)
                // Alarm tuning
                .alarmPeriodSeconds(300)
                .alarmEvaluationPeriods(3)
                .alarmDatapointsToAlarm(2)
                .rateAlarmName("acme-dev-app-processor-error-rate")
                .volumeAlarmName("acme-dev-app-processor-error-volume")
                // EventBridge Pipe tuning
                .eventbridgePipeName("acme-dev-app-processor-replay")
                .eventbridgePipeBatchSize(5)
                .eventbridgePipeLogLevel("INFO")
                .cloudwatchLogRetentionDays(30)
                .targetLambdaInputTemplate("<$.requestPayload>")
                .build());

        app.synth();
    }
}
