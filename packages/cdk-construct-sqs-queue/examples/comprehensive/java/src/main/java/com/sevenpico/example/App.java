package com.sevenpico.example;

import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.sqs.queue.SqsQueue;
import com.sevenpico.cdk.construct.sqs.queue.SqsQueueProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SqsQueueComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .tags(Map.of("Owner", "platform-team", "CostCenter", "engineering"))
            .build());

        new SqsQueue(stack, "Queue",
            SqsQueueProps.builder()
                .context(context)
                .visibilityTimeoutSeconds(300)
                .messageRetentionSeconds(86400)
                .dlqEnabled(true)
                .sqsManagedSseEnabled(true)
                .build());

        app.synth();
    }
}
