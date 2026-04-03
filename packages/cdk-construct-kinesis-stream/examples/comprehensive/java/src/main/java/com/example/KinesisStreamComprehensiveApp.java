package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructkinesisstream.KinesisStream;
import com.sevenpico.cdkconstructkinesisstream.KinesisStreamProps;

public class KinesisStreamComprehensiveApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "KinesisStreamComprehensiveStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        KinesisStream.Builder.create(stack, "Stream")
            .context(context)
            .shardCount(2)
            .retentionPeriodHours(48)
            .streamMode("PROVISIONED")
            .encryptionType("KMS")
            .consumerCount(1)
            .build();

        app.synth();
    }
}
