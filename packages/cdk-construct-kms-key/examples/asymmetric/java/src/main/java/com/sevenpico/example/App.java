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
        var stack = new Stack(app, "KmsKeyAsymmetricStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        // RSA_2048 + SIGN_VERIFY creates an asymmetric key for signing operations.
        // Key rotation is not supported for asymmetric keys.
        new KmsKey(stack, "Key",
            KmsKeyProps.builder()
                .context(context)
                .keySpec("RSA_2048")
                .keyUsage("SIGN_VERIFY")
                .enableKeyRotation(false)
                .alias("alias/acme-dev-app-signing")
                .description("Asymmetric RSA signing key")
                .build());

        app.synth();
    }
}
