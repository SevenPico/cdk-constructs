package com.sevenpico.example;

import java.util.List;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.bridge.CdkBridge;
import com.sevenpico.cdk.construct.s3.log.storage.S3LogStorage;
import com.sevenpico.cdk.construct.s3.log.storage.S3LogStorageProps;
import com.sevenpico.cdk.construct.s3.bucket.S3LifecycleRule;
import com.sevenpico.cdk.construct.s3.bucket.S3LifecycleTransition;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3LogStorageComprehensiveStack");

        // Load context and platform references from CDK Bridge JSON.
        var context = CdkBridge.context(stack);
        var logKmsKeyArn = CdkBridge.string(stack, "logKmsKeyArn");
        var logsBucketName = CdkBridge.string(stack, "logsBucketName");

        new S3LogStorage(stack, "LogStorage",
            S3LogStorageProps.builder()
                .context(context)
                // KMS encryption
                .sseAlgorithm("aws:kms")
                .kmsKeyArn(logKmsKeyArn)
                .bucketKeyEnabled(true)
                // Access logs
                .accessLogBucketName(logsBucketName)
                .accessLogPrefix("acme-dev-app-logs/")
                // SQS notifications
                .notificationsEnabled(true)
                .notificationsType("SQS")
                .notificationsPrefix("raw/")
                // Lifecycle rules
                .lifecycleRules(List.of(
                    S3LifecycleRule.builder()
                        .id("expire-old-logs")
                        .enabled(true)
                        .expirationDays(365)
                        .noncurrentVersionExpirationDays(30)
                        .transitions(List.of(
                            S3LifecycleTransition.builder()
                                .storageClass("GLACIER")
                                .transitionAfterDays(90)
                                .build()
                        ))
                        .abortIncompleteMultipartUploadAfterDays(7)
                        .build()
                ))
                // Public access blocks
                .blockPublicAcls(true)
                .blockPublicPolicy(true)
                .ignorePublicAcls(true)
                .restrictPublicBuckets(true)
                // SSL and versioning
                .allowSslRequestsOnly(true)
                .versioningEnabled(true)
                .objectOwnership("ObjectWriter")
                .build());

        app.synth();
    }
}
