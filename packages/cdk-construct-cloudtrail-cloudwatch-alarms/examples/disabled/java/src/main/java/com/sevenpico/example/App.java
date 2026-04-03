package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.cloudtrail.cloudwatch.alarms.CloudtrailCloudwatchAlarms;
import com.sevenpico.cdk.construct.cloudtrail.cloudwatch.alarms.CloudtrailCloudwatchAlarmsProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "CloudtrailCloudwatchAlarmsDisabledStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .enabled(false)
            .build());

        new CloudtrailCloudwatchAlarms(stack, "Alarms",
            CloudtrailCloudwatchAlarmsProps.builder()
                .context(context)
                .logGroupName("/aws/cloudtrail/acme-dev-app")
                .snsTopicArn("arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts")
                .build());

        app.synth();
    }
}
