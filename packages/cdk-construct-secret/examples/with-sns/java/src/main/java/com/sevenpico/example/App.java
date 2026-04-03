package com.sevenpico.example;

import java.util.List;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.secret.Secret;
import com.sevenpico.cdk.construct.secret.SecretProps;
import com.sevenpico.cdk.construct.secret.SecretReadPrincipal;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "SecretWithSnsStack");

        var context = ContextFns.make(ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build());

        // Secret with SNS topic for change notifications, read principal, and description
        new Secret(stack, "Secret", SecretProps.builder()
                .context(context)
                .description("Application credentials with SNS notifications")
                .createSns(true)
                .secretReadPrincipals(List.of(
                        SecretReadPrincipal.builder()
                                .type("AWS")
                                .identifiers(List.of("arn:aws:iam::123456789012:role/acme-app-role"))
                                .build()
                ))
                .snsPubPrincipals(List.of(
                        SecretReadPrincipal.builder()
                                .type("Service")
                                .identifiers(List.of("secretsmanager.amazonaws.com"))
                                .build()
                ))
                .snsSubPrincipals(List.of(
                        SecretReadPrincipal.builder()
                                .type("AWS")
                                .identifiers(List.of("arn:aws:iam::123456789012:role/acme-ops-role"))
                                .build()
                ))
                .build());

        app.synth();
    }
}
