package com.sevenpico.example;

import java.util.List;
import java.util.Map;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.lambda.function.LambdaEnvironment;
import com.sevenpico.cdk.construct.lambda.function.LambdaFunction;
import com.sevenpico.cdk.construct.lambda.function.LambdaFunctionProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "LambdaFunctionComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app")
            .tags(Map.of("Owner", "platform-team", "CostCenter", "engineering"))
            .build());

        new LambdaFunction(stack, "Fn",
            LambdaFunctionProps.builder()
                .context(context)
                .runtime("nodejs20.x")
                .handler("index.handler")
                .s3Bucket("acme-dev-app-lambda-artifacts")
                .s3Key("functions/my-function.zip")
                .description("Acme data processing function")
                .memorySizeMb(512)
                .timeoutSeconds(30)
                .architecture("arm64")
                .tracingMode("Active")
                .lambdaInsightsEnabled(true)
                .cloudwatchLogsRetentionDays(30)
                .reservedConcurrentExecutions(10)
                .environment(LambdaEnvironment.builder()
                    .variables(Map.of("LOG_LEVEL", "INFO", "STAGE", "dev"))
                    .build())
                .ssmParameterNames(List.of("/acme/dev/app/db-url"))
                .build());

        app.synth();
    }
}
