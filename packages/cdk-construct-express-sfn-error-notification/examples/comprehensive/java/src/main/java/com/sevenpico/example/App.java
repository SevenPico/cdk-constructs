package com.sevenpico.example;

import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.express.sfn.error.notification.ExpressSfnErrorNotification;
import com.sevenpico.cdk.construct.express.sfn.error.notification.ExpressSfnErrorNotificationProps;
import com.sevenpico.cdk.construct.express.sfn.error.notification.ExpressSfnTarget;
import com.sevenpico.cdk.construct.express.sfn.error.notification.SqsKmsConfig;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "ExpressSfnErrorNotificationComprehensiveStack");

        // Load context and platform references from CDK Bridge JSON.
        var context = CdkBridge.context(stack);
        var processorArn = CdkBridge.string(stack, "processorArn");
        var alarmsSnsTopicArn = CdkBridge.string(stack, "alarmsSnsTopicArn");
        var kmsKeyArn = CdkBridge.string(stack, "kmsKeyArn");
        var kmsKeyId = CdkBridge.string(stack, "kmsKeyId");

        new ExpressSfnErrorNotification(stack, "ExpressSfnMonitor",
            ExpressSfnErrorNotificationProps.builder()
                .context(context)
                .stepFunctions(Map.of(
                    "processor", ExpressSfnTarget.builder()
                        .arn(processorArn)
                        .sqsQueueName("acme-dev-app-processor-dlq")
                        .rateAlarmName("acme-dev-app-processor-error-rate")
                        .volumeAlarmName("acme-dev-app-processor-error-volume")
                        .build()
                ))
                .rateAlarmSnsTopicArn(alarmsSnsTopicArn)
                .volumeAlarmSnsTopicArn(alarmsSnsTopicArn)
                // KMS-encrypted DLQs
                .sqsKmsConfig(SqsKmsConfig.builder().keyId(kmsKeyId).keyArn(kmsKeyArn).build())
                .sqsMessageRetentionSeconds(1209600)
                .sqsVisibilityTimeoutSeconds(60)
                // Alarm tuning
                .alarmPeriodSeconds(300)
                .alarmEvaluationPeriods(3)
                .alarmDatapointsToAlarm(2)
                // EventBridge Pipe tuning
                .eventbridgePipeBatchSize(5)
                .eventbridgePipeLogLevel("INFO")
                .cloudwatchLogRetentionDays(30)
                .targetStepFunctionInputTemplate("<$.detail.input>")
                .build());

        app.synth();
    }
}
