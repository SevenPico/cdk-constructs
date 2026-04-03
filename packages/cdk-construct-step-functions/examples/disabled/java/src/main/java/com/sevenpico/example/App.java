package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.Context;
import com.sevenpico.cdk.construct.step.functions.StepFunctions;
import com.sevenpico.cdk.construct.step.functions.StepFunctionsProps;
import java.util.Map;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "StepFunctionsDisabledStack");

        Context context = ContextFns.make(b -> b
            .namespace("acme").environment("dev").stage("app").enabled(false));

        StepFunctions.Builder.create(stack, "StateMachine")
            .context(context)
            .roleDescription("Execution role for acme-dev-app state machine")
            .definition(Map.of(
                "Comment", "Minimal state machine",
                "StartAt", "Pass",
                "States", Map.of(
                    "Pass", Map.of("Type", "Pass", "End", true)
                )
            ))
            .build();

        app.synth();
    }
}
