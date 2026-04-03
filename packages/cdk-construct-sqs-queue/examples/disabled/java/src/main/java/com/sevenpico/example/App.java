package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.sqs.queue.SqsQueue;
import com.sevenpico.cdk.construct.sqs.queue.SqsQueueProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SqsQueueDisabledStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .enabled(false)
            .build());

        new SqsQueue(stack, "Queue",
            SqsQueueProps.builder()
                .context(context)
                .build());

        app.synth();
    }
}
