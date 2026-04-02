package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.s3.bucket.S3Bucket;
import com.sevenpico.cdk.construct.s3.bucket.S3BucketProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3BucketDisabledStack");

        // enabled=false — S3Bucket creates no resources.
        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").enabled(false).build());

        new S3Bucket(stack, "Bucket",
            S3BucketProps.builder()
                .context(context)
                .build());

        app.synth();
    }
}
