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
        var stack = new Stack(app, "KmsKeyComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        var policy = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\","
            + "\"Principal\":{\"AWS\":\"arn:aws:iam::123456789012:root\"},"
            + "\"Action\":\"kms:*\",\"Resource\":\"*\"}]}";

        new KmsKey(stack, "Key",
            KmsKeyProps.builder()
                .context(context)
                .alias("alias/acme-dev-app-custom")
                .description("Comprehensive KMS key example — all props exercised")
                .enableKeyRotation(false)
                .pendingWindowInDays(14)
                .multiRegion(true)
                .policy(policy)
                .build());

        app.synth();
    }
}
