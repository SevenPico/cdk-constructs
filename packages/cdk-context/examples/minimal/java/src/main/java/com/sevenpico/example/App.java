package com.sevenpico.example;

import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.context.Context;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "MinimalContextExample");

        // Build a context with required props only: namespace, environment, stage.
        Context ctx = ContextFns.make(ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build());

        System.out.println("Context ID:   " + ContextFns.id(ctx));          // acme-dev-app
        System.out.println("Is enabled:   " + ContextFns.isEnabled(ctx));   // true
        System.out.println("Tags:         " + ContextFns.tags(ctx));

        app.synth();
    }
}
