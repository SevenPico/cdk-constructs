package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructdynamodb.Dynamodb;

public class DynamodbMinimalApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "DynamodbMinimalStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        Dynamodb.Builder.create(stack, "Table")
            .context(context)
            .hashKey("id")
            .build();

        app.synth();
    }
}
