package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructses.Ses;
import com.sevenpico.cdkconstructses.SesProps;

public class SesWithIamGroupApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "SesWithIamGroupStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        Ses.Builder.create(stack, "Ses")
            .context(context)
            .sesGroupEnabled(true)
            .sesGroupName("ses-senders")
            .build();

        app.synth();
    }
}
