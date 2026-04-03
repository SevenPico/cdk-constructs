package com.example;

import java.util.Arrays;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructcloudwatchevents.CloudwatchEvents;
import com.sevenpico.cdkconstructcloudwatchevents.CloudwatchEventsProps;
import com.sevenpico.cdkconstructcloudwatchevents.CloudwatchEventRule;
import com.sevenpico.cdkconstructcloudwatchevents.CloudwatchEventTarget;

public class CloudwatchEventsDisabledApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "CloudwatchEventsDisabledStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .enabled(false)
                .build()
        );

        CloudwatchEvents.Builder.create(stack, "Events")
            .context(context)
            .rules(Arrays.asList(
                CloudwatchEventRule.builder()
                    .name("heartbeat")
                    .schedule("rate(5 minutes)")
                    .targets(Arrays.asList(
                        CloudwatchEventTarget.builder()
                            .type("sns")
                            .arn("arn:aws:sns:us-east-1:123456789012:my-topic")
                            .build()
                    ))
                    .build()
            ))
            .build();

        app.synth();
    }
}
