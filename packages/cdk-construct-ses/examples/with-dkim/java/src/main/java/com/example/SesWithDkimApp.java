package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructses.Ses;
import com.sevenpico.cdkconstructses.SesProps;

public class SesWithDkimApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "SesWithDkimStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        Ses.Builder.create(stack, "Ses")
            .context(context)
            .verifyDomain(true)
            .verifyDkim(true)
            .zoneId("Z0PUBLICZONEID00000")
            .zoneName("dev.acme.example.com")
            .build();

        app.synth();
    }
}
