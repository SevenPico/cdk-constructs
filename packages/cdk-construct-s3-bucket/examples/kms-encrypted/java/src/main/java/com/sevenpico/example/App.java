package com.sevenpico.example;

import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.s3.bucket.S3Bucket;
import com.sevenpico.cdk.construct.s3.bucket.S3BucketProps;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3BucketKmsEncryptedStack");

        // Context and kmsKeyArn come from the bridge fixture (cdk.json sevenpico block)
        var context = CdkBridge.context(stack);
        var kmsKeyArn = CdkBridge.string(stack, "kmsKeyArn");

        // KMS-encrypted bucket — sseAlgorithm 'aws:kms' with a KMS key ARN from the bridge fixture.
        // Creates a KMS grant resource in addition to the bucket.
        new S3Bucket(stack, "Bucket",
            S3BucketProps.builder()
                .context(context)
                .sseAlgorithm("aws:kms")
                .kmsKeyArn(kmsKeyArn)
                .bucketKeyEnabled(true)
                .allowEncryptedUploadsOnly(true)
                .build());

        app.synth();
    }
}
