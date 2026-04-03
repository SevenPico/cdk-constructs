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

public class CloudwatchEventsComprehensiveApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "CloudwatchEventsComprehensiveStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        CloudwatchEvents.Builder.create(stack, "Events")
            .context(context)
            .rules(Arrays.asList(
                CloudwatchEventRule.builder()
                    .name("heartbeat")
                    .description("Scheduled heartbeat every 5 minutes")
                    .schedule("rate(5 minutes)")
                    .targets(Arrays.asList(
                        CloudwatchEventTarget.builder()
                            .type("sns")
                            .arn("arn:aws:sns:us-east-1:123456789012:my-topic")
                            .build()
                    ))
                    .build(),
                CloudwatchEventRule.builder()
                    .name("ec2-state-change")
                    .description("Reacts to EC2 instance state changes")
                    .eventPattern("{\"source\":[\"aws.ec2\"],\"detail-type\":[\"EC2 Instance State-change Notification\"]}")
                    .targets(Arrays.asList(
                        CloudwatchEventTarget.builder()
                            .type("sqs")
                            .arn("arn:aws:sqs:us-east-1:123456789012:my-queue")
                            .build()
                    ))
                    .build()
            ))
            .build();

        app.synth();
    }
}
