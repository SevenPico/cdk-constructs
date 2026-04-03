package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.lambda.function.LambdaFunction;
import com.sevenpico.cdk.construct.lambda.function.LambdaFunctionProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "LambdaFunctionMinimalStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        new LambdaFunction(stack, "Fn",
            LambdaFunctionProps.builder()
                .context(context)
                .runtime("nodejs20.x")
                .handler("index.handler")
                .s3Bucket("acme-dev-app-lambda-artifacts")
                .s3Key("functions/my-function.zip")
                .build());

        app.synth();
    }
}
