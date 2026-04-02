package com.example;

import java.util.Arrays;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructsns.Sns;
import com.sevenpico.cdkconstructsns.SnsProps;

public class SnsComprehensiveApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "SnsComprehensiveStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        Sns.Builder.create(stack, "Topic")
            .context(context)
            .encryptionEnabled(true)
            .allowedAwsServicesForPublish(Arrays.asList("events.amazonaws.com"))
            .sqsDlqEnabled(true)
            .build();

        app.synth();
    }
}
