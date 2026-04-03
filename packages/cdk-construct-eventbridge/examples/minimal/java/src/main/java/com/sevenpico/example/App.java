package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.eventbridge.Eventbridge;
import com.sevenpico.cdk.construct.eventbridge.EventbridgeProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "EventbridgeMinimalStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        new Eventbridge(stack, "Bus",
            EventbridgeProps.builder()
                .context(context)
                .build());

        app.synth();
    }
}
