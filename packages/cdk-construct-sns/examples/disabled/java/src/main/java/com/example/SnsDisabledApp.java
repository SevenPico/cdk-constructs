package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructsns.Sns;

public class SnsDisabledApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "SnsDisabledStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .enabled(false)
                .build()
        );

        Sns.Builder.create(stack, "Topic")
            .context(context)
            .build();

        app.synth();
    }
}
