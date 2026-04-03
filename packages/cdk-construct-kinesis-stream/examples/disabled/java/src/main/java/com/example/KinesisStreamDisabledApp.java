package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructkinesisstream.KinesisStream;

public class KinesisStreamDisabledApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "KinesisStreamDisabledStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .enabled(false)
                .build()
        );

        KinesisStream.Builder.create(stack, "Stream")
            .context(context)
            .build();

        app.synth();
    }
}
