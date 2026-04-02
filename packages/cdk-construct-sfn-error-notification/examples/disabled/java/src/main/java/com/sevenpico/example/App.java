package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.sfn.error.notification.SfnErrorNotification;
import com.sevenpico.cdk.construct.sfn.error.notification.SfnErrorNotificationProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SfnErrorNotificationDisabledStack");

        // Load context with enabled: false — construct will create zero resources.
        var context = CdkBridge.context(stack);
        var stateMachineArn = CdkBridge.string(stack, "stateMachineArn");
        var alarmsSnsTopicArn = CdkBridge.string(stack, "alarmsSnsTopicArn");

        new SfnErrorNotification(stack, "SfnMonitor",
            SfnErrorNotificationProps.builder()
                .context(context)
                .stateMachineArn(stateMachineArn)
                .rateAlarmSnsTopicArn(alarmsSnsTopicArn)
                .volumeAlarmSnsTopicArn(alarmsSnsTopicArn)
                .build());

        app.synth();
    }
}
