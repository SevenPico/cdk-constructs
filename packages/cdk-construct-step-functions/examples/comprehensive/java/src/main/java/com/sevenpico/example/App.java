package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.Context;
import com.sevenpico.cdk.construct.step.functions.StepFunctions;
import com.sevenpico.cdk.construct.step.functions.StepFunctionsProps;
import com.sevenpico.cdk.construct.step.functions.StepFunctionsLoggingConfig;
import java.util.List;
import java.util.Map;

public class App {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "StepFunctionsComprehensiveStack");

        Context context = ContextFns.make(b -> b
            .namespace("acme").environment("dev").stage("app"));

        StepFunctions.Builder.create(stack, "StateMachine")
            .context(context)
            .roleDescription("Execution role for acme-dev-app workflow")
            .type("EXPRESS")
            .tracingEnabled(true)
            .logGroupRetentionDays(30)
            .loggingConfiguration(StepFunctionsLoggingConfig.builder()
                .level("ALL")
                .includeExecutionData(true)
                .build())
            .managedPolicyArns(List.of("arn:aws:iam::aws:policy/AWSLambda_ReadOnlyAccess"))
            .definition(Map.of(
                "Comment", "Comprehensive state machine with Lambda invoke",
                "StartAt", "ProcessInput",
                "States", Map.of(
                    "ProcessInput", Map.of(
                        "Type", "Task",
                        "Resource", "arn:aws:states:::lambda:invoke",
                        "Parameters", Map.of(
                            "FunctionName", "arn:aws:lambda:us-east-1:123456789012:function:acme-dev-app-processor",
                            "Payload.$", "$"
                        ),
                        "Next", "Success"
                    ),
                    "Success", Map.of("Type", "Succeed")
                )
            ))
            .build();

        app.synth();
    }
}
