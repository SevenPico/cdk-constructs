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
        var stack = new Stack(app, "S3BucketS3ManagedEncryptedStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        // S3-managed encryption — AES256 (default). No KMS key needed.
        new S3Bucket(stack, "Bucket",
            S3BucketProps.builder()
                .context(context)
                .sseAlgorithm("AES256")
                .build());

        app.synth();
    }
}
