package com.sevenpico.example;

import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.express.sfn.error.notification.ExpressSfnErrorNotification;
import com.sevenpico.cdk.construct.express.sfn.error.notification.ExpressSfnErrorNotificationProps;
import com.sevenpico.cdk.construct.express.sfn.error.notification.ExpressSfnTarget;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "ExpressSfnErrorNotificationMultiTargetStack");

        // Load context and platform references from CDK Bridge JSON.
        var context = CdkBridge.context(stack);
        var processorArn = CdkBridge.string(stack, "processorArn");
        var validatorArn = CdkBridge.string(stack, "validatorArn");
        var alarmsSnsTopicArn = CdkBridge.string(stack, "alarmsSnsTopicArn");

        new ExpressSfnErrorNotification(stack, "ExpressSfnMonitor",
            ExpressSfnErrorNotificationProps.builder()
                .context(context)
                .stepFunctions(Map.of(
                    "processor", ExpressSfnTarget.builder().arn(processorArn).build(),
                    "validator", ExpressSfnTarget.builder().arn(validatorArn).build()
                ))
                .rateAlarmSnsTopicArn(alarmsSnsTopicArn)
                .volumeAlarmSnsTopicArn(alarmsSnsTopicArn)
                .build());

        app.synth();
    }
}
