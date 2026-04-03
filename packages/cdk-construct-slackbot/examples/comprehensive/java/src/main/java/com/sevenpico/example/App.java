package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.slackbot.Slackbot;
import com.sevenpico.cdk.construct.slackbot.SlackbotProps;
import java.util.List;
import java.util.Map;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SlackbotComprehensiveStack");

        // Load context and platform references from CDK Bridge JSON.
        var context = CdkBridge.context(stack);
        var slackTokenArn = CdkBridge.string(stack, "slackTokenArn");
        var secretsKmsKeyArn = CdkBridge.string(stack, "secretsKmsKeyArn");

        new Slackbot(stack, "SlackbotConstruct",
            SlackbotProps.builder()
                .context(context)
                // Multiple Slack channels: SNS attribute name -> Slack channel ID
                .slackChannels(Map.of(
                    "alerts", "C01234ABCDE",
                    "deployments", "C09876ZYXWV",
                    "incidents", "C0INCIDENT0"
                ))
                .slackTokenSecretArn(slackTokenArn)
                .slackTokenSecretKmsKeyArn(secretsKmsKeyArn)
                // Custom Lambda deployment package
                .lambdaCodePath("./lambda")
                .lambdaRuntime("python3.11")
                // Custom CloudWatch log retention (30 days instead of default 90)
                .cloudwatchLogExpirationDays(30)
                // Allow CloudWatch Alarms service to publish notifications
                .snsPubPrincipals(Map.of(
                    "Service", List.of("cloudwatch.amazonaws.com", "events.amazonaws.com")
                ))
                // Allow specific IAM role to subscribe
                .snsSubPrincipals(Map.of(
                    "AWS", List.of("arn:aws:iam::123456789012:role/acme-dev-app-ops-role")
                ))
                .build());

        app.synth();
    }
}
