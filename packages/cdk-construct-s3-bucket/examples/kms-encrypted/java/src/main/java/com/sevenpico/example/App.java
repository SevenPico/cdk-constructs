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
        var stack = new Stack(app, "S3BucketKmsEncryptedStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        // KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN.
        // Creates a KMS grant resource in addition to the bucket.
        new S3Bucket(stack, "Bucket",
            S3BucketProps.builder()
                .context(context)
                .sseAlgorithm("aws:kms")
                .kmsKeyArn("arn:aws:kms:us-east-1:123456789012:key/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
                .bucketKeyEnabled(true)
                .allowEncryptedUploadsOnly(true)
                .build());

        app.synth();
    }
}
