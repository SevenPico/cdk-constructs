package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.kms.key.KmsKey;
import com.sevenpico.cdk.construct.kms.key.KmsKeyProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "KmsKeyMinimalStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        new KmsKey(stack, "Key",
            KmsKeyProps.builder()
                .context(context)
                .build());

        app.synth();
    }
}
