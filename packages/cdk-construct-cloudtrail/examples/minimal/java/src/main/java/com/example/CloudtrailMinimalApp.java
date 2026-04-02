package com.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructcloudtrail.CloudTrail;

public class CloudtrailMinimalApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "CloudtrailMinimalStack");

        com.sevenpico.cdkcontext.Context context = ContextFns.make(
            ContextProps.builder()
                .namespace("acme")
                .environment("dev")
                .stage("app")
                .build()
        );

        CloudTrail.Builder.create(stack, "Trail")
            .context(context)
            .s3BucketName("my-cloudtrail-logs-bucket")
            .build();

        app.synth();
    }
}
