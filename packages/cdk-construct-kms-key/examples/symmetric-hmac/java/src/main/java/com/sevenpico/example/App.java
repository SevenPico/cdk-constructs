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
        var stack = new Stack(app, "KmsKeySymmetricHmacStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        // HMAC_256 + GENERATE_VERIFY_MAC creates an HMAC key for MAC generation/verification.
        // Key rotation is not supported for HMAC keys.
        new KmsKey(stack, "Key",
            KmsKeyProps.builder()
                .context(context)
                .keySpec("HMAC_256")
                .keyUsage("GENERATE_VERIFY_MAC")
                .enableKeyRotation(false)
                .alias("alias/acme-dev-app-hmac")
                .description("HMAC-256 key for MAC generation and verification")
                .build());

        app.synth();
    }
}
