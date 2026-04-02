package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructses.Ses;

public class SesDisabledApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "SesDisabledStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .enabled(false)
                .build()
        );

        Ses.Builder.create(stack, "Ses")
            .context(context)
            .build();

        app.synth();
    }
}
