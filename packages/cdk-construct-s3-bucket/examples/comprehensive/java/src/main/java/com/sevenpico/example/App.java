package com.sevenpico.example;

import java.util.List;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdk.context.ContextFns;
import com.sevenpico.cdk.context.ContextProps;
import com.sevenpico.cdk.construct.s3.bucket.S3Bucket;
import com.sevenpico.cdk.construct.s3.bucket.S3BucketProps;
import com.sevenpico.cdk.construct.s3.bucket.S3LifecycleRule;
import com.sevenpico.cdk.construct.s3.bucket.S3LifecycleTransition;
import com.sevenpico.cdk.construct.s3.bucket.S3CorsRule;

public class App {
    public static void main(final String[] args) {
        var app = new App();
        var stack = new Stack(app, "S3BucketComprehensiveStack");

        var context = ContextFns.make(ContextProps.builder()
            .namespace("acme").environment("dev").stage("app").build());

        var lifecycleRule = S3LifecycleRule.builder()
            .id("expire-old-versions")
            .enabled(true)
            .noncurrentVersionExpirationDays(30)
            .transitions(List.of(
                S3LifecycleTransition.builder()
                    .storageClass("STANDARD_IA").transitionAfterDays(90).build(),
                S3LifecycleTransition.builder()
                    .storageClass("GLACIER").transitionAfterDays(365).build()
            ))
            .abortIncompleteMultipartUploadAfterDays(7)
            .build();

        var corsRule = S3CorsRule.builder()
            .allowedMethods(List.of("GET", "PUT"))
            .allowedOrigins(List.of("https://acme.example.com"))
            .allowedHeaders(List.of("*"))
            .maxAge(3600)
            .build();

        new S3Bucket(stack, "Bucket",
            S3BucketProps.builder()
                .context(context)
                .versioningEnabled(true)
                .transferAccelerationEnabled(true)
                .objectOwnership("BucketOwnerEnforced")
                .allowSslRequestsOnly(true)
                .lifecycleRules(List.of(lifecycleRule))
                .corsRules(List.of(corsRule))
                .build());

        app.synth();
    }
}
