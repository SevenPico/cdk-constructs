package com.sevenpico.example;

import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.context.Context;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;

import java.util.Arrays;
import java.util.Map;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "ComprehensiveContextExample");

        // Build a context with all available props exercised.
        Context ctx = ContextFns.make(ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .name("api")
                .tenant("tenant1")
                .region("use1")
                .delimiter("-")
                .labelOrder(Arrays.asList("namespace", "environment", "stage", "name", "attributes"))
                .labelKeyCase("title")
                .labelValueCase("lower")
                .idLengthLimit(32)
                .attributes(Arrays.asList("v2"))
                .tags(Map.of("CostCenter", "engineering", "Owner", "platform-team"))
                .additionalTagMap(Map.of("ManagedBy", "cdk"))
                .labelsAsTags(Arrays.asList("namespace", "environment", "stage", "name"))
                .build());

        System.out.println("Context ID:    " + ContextFns.id(ctx));
        System.out.println("Is enabled:    " + ContextFns.isEnabled(ctx));
        System.out.println("Tags:          " + ContextFns.tags(ctx));

        // Demonstrate context extension
        Context childCtx = ContextFns.extend(ctx, ContextProps.builder()
                .attributes(Arrays.asList("worker"))
                .build());
        System.out.println("Child ID:      " + ContextFns.id(childCtx));

        app.synth();
    }
}
