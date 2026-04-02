package com.example;

import java.util.Arrays;
import software.amazon.awscdk.App;
import software.amazon.awscdk.Stack;
import com.sevenpico.cdkcontext.ContextFns;
import com.sevenpico.cdkcontext.ContextProps;
import com.sevenpico.cdkconstructcloudtrail.CloudTrail;
import com.sevenpico.cdkconstructcloudtrail.CloudtrailProps;
import com.sevenpico.cdkconstructcloudtrail.CloudtrailDataEventSelector;

public class CloudtrailComprehensiveApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "CloudtrailComprehensiveStack");

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
            .s3KeyPrefix("cloudtrail/")
            .includeGlobalServiceEvents(true)
            .isMultiRegionTrail(true)
            .enableLogFileValidation(true)
            .cloudWatchLogsEnabled(true)
            .cloudWatchLogsRetentionDays(90)
            .enableInsights(true)
            .managementEvents("ReadWrite")
            .dataEvents(Arrays.asList(
                CloudtrailDataEventSelector.builder()
                    .resourceType("AWS::S3::Object")
                    .resourceArns(Arrays.asList("arn:aws:s3:::"))
                    .build()
            ))
            .build();

        app.synth();
    }
}
