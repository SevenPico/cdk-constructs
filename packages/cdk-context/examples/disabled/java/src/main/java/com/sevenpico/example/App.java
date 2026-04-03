package com.sevenpico.example;

import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.context.Context;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;

import java.util.Arrays;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "DisabledContextExample");

        // Build a disabled context.
        Context ctx = ContextFns.make(ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .enabled(false)
                .build());

        System.out.println("Context ID:  " + ContextFns.id(ctx));
        System.out.println("Is enabled:  " + ContextFns.isEnabled(ctx));  // false

        // Extending a disabled context keeps enabled=false — the disabled flag is sticky.
        Context childCtx = ContextFns.extend(ctx, ContextProps.builder()
                .attributes(Arrays.asList("worker"))
                .enabled(true)
                .build());
        System.out.println("Child enabled: " + ContextFns.isEnabled(childCtx));  // still false

        app.synth();
    }
}
