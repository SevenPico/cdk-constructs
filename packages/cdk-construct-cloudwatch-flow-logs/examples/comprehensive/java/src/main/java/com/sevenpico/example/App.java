package com.sevenpico.example;

import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.cloudwatch.flowlogs.CloudwatchFlowLogs;
import com.sevenpico.cdk.construct.cloudwatch.flowlogs.CloudwatchFlowLogsProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "CloudwatchFlowLogsComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .tags(Map.of("Owner", "platform-team", "CostCenter", "engineering"))
            .build());

        new CloudwatchFlowLogs(stack, "FlowLogs",
            CloudwatchFlowLogsProps.builder()
                .context(context)
                .vpcId("vpc-0123456789abcdef0")
                .trafficType("REJECT")
                .cloudwatchLogRetentionDays(90)
                .build());

        app.synth();
    }
}
