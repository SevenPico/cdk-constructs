package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.sfn.error.notification.SfnErrorNotification;
import com.sevenpico.cdk.construct.sfn.error.notification.SfnErrorNotificationProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SfnErrorNotificationComprehensiveStack");

        // Load context and platform references from CDK Bridge JSON.
        var context = CdkBridge.context(stack);
        var stateMachineArn = CdkBridge.string(stack, "stateMachineArn");
        var alarmsSnsTopicArn = CdkBridge.string(stack, "alarmsSnsTopicArn");
        var kmsKeyArn = CdkBridge.string(stack, "kmsKeyArn");

        new SfnErrorNotification(stack, "SfnMonitor",
            SfnErrorNotificationProps.builder()
                .context(context)
                .stateMachineArn(stateMachineArn)
                .rateAlarmSnsTopicArn(alarmsSnsTopicArn)
                .volumeAlarmSnsTopicArn(alarmsSnsTopicArn)
                // KMS-encrypted DLQ
                .sqsKmsKeyArn(kmsKeyArn)
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
                .targetStepFunctionInputTemplate("<$.detail.input>")
                // EventBridge rule name
                .eventbridgeRuleName("acme-dev-app-processor-failed")
                .build());

        app.synth();
    }
}
