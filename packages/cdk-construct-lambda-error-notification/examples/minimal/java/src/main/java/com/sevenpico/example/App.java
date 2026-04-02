package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.lambda.error.notification.LambdaErrorNotification;
import com.sevenpico.cdk.construct.lambda.error.notification.LambdaErrorNotificationProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "LambdaErrorNotificationMinimalStack");

        // Load context and platform references from CDK Bridge JSON.
        var context = CdkBridge.context(stack);
        var lambdaArn = CdkBridge.string(stack, "lambdaArn");
        var lambdaFunctionName = CdkBridge.string(stack, "lambdaFunctionName");
        var lambdaRoleName = CdkBridge.string(stack, "lambdaRoleName");
        var alarmsSnsTopicArn = CdkBridge.string(stack, "alarmsSnsTopicArn");

        new LambdaErrorNotification(stack, "LambdaMonitor",
            LambdaErrorNotificationProps.builder()
                .context(context)
                .lambdaArn(lambdaArn)
                .lambdaFunctionName(lambdaFunctionName)
                .lambdaRoleName(lambdaRoleName)
                .rateAlarmSnsTopicArn(alarmsSnsTopicArn)
                .volumeAlarmSnsTopicArn(alarmsSnsTopicArn)
                .build());

        app.synth();
    }
}
