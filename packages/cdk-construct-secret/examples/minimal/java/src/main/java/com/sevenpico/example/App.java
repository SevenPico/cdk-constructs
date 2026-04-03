package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.secret.Secret;
import com.sevenpico.cdk.construct.secret.SecretProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SecretMinimalStack");

        var context = ContextFns.make(ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build());

        // Minimal Secret — all defaults: KMS key auto-created, no SNS
        new Secret(stack, "Secret", SecretProps.builder()
                .context(context)
                .build());

        app.synth();
    }
}
