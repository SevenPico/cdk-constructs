package com.sevenpico.example;

import java.util.List;
import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.eventbridge.rule.EventbridgeRule;
import com.sevenpico.cdk.construct.eventbridge.rule.EventbridgeRuleProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "EventbridgeRuleComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .tags(Map.of("Owner", "platform-team", "CostCenter", "engineering"))
            .build());

        new EventbridgeRule(stack, "Rule",
            EventbridgeRuleProps.builder()
                .context(context)
                .description("Route acme.app order events to processing queue")
                .eventPattern(Map.of(
                    "source", List.of("acme.app"),
                    "detail-type", List.of("OrderPlaced")))
                .targetArn("arn:aws:sqs:us-east-1:123456789012:acme-dev-app-orders")
                .ruleEnabled(true)
                .sourceEventBusName("acme-dev-app-events")
                .build());

        app.synth();
    }
}
