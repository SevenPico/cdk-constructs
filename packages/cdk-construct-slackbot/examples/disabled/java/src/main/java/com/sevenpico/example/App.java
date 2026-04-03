package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.slackbot.Slackbot;
import com.sevenpico.cdk.construct.slackbot.SlackbotProps;
import java.util.Map;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SlackbotDisabledStack");

        // Load context from CDK Bridge JSON. The cdk.json sets enabled: false,
        // so the construct will create no resources.
        var context = CdkBridge.context(stack);
        var slackTokenArn = CdkBridge.string(stack, "slackTokenArn");

        new Slackbot(stack, "SlackbotConstruct",
            SlackbotProps.builder()
                .context(context)
                .slackChannels(Map.of("alerts", "C01234ABCDE"))
                .slackTokenSecretArn(slackTokenArn)
                .lambdaCodePath("./lambda")
                .build());

        app.synth();
    }
}
