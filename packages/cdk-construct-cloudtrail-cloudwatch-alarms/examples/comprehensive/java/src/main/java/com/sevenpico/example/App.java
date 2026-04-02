package com.sevenpico.example;

import java.util.List;
import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.cloudtrail.cloudwatch.alarms.CloudtrailCloudwatchAlarms;
import com.sevenpico.cdk.construct.cloudtrail.cloudwatch.alarms.CloudtrailCloudwatchAlarmsProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "CloudtrailCloudwatchAlarmsComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .tags(Map.of("Owner", "platform-team", "CostCenter", "engineering"))
            .build());

        new CloudtrailCloudwatchAlarms(stack, "Alarms",
            CloudtrailCloudwatchAlarmsProps.builder()
                .context(context)
                .logGroupName("/aws/cloudtrail/acme-dev-app")
                .snsTopicArn("arn:aws:sns:us-east-1:123456789012:acme-dev-app-alerts")
                .alarmNamespace("AcmeSecurity")
                .alarmPeriodSeconds(60)
                .alarmEvaluationPeriods(1)
                .alarmThreshold(1)
                .enabledAlarms(List.of("unauthorized-api", "root-usage", "iam-policy-changes", "cloudtrail-changes"))
                .build());

        app.synth();
    }
}
